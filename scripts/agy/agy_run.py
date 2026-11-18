# -*- coding: utf-8 -*-
"""Ejecutor de agy (Gemini) para Axiom. Adaptado de ejecutor-agy de UNIFRANZ (1-nov-2026).

Claude NO hace el trabajo mecanico: lo encarga, revisa barato (DIFF + CONTROLES) y decide.
El trabajo se hace en una copia aislada del repo (git worktree) y agy no puede escribir fuera de ella (candado).

Uso (desde la raiz del repo, correrlo en segundo plano):
  python scripts/agy/agy_run.py --tipo <tipo> --nivel mecanico|lectura|criterio|criterio-alto --pedido <archivo.md>
         [--leer <carpeta>]... [--despues "<comando>"]... [--solo-texto] [--timeout 900] [--seguir <id> --pedido <correccion.md>]

Si no pasas --despues, corre los controles de siempre dentro de la copia: tsc, lint y tests.
Deja en <trabajo>/<id>/: ENTREGA.json, DIFF.txt (lineas enteras), CONTROLES.txt, RESPUESTA.md.
Revisar SOLO eso. Para traer el resultado a main: python scripts/agy/aplicar.py <id> [--si]
"""
import argparse, os, sys, json, time, subprocess, datetime, re

AQUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(AQUI))
ARRANQUE = os.path.join(AQUI, "arranque")      # agy arranca aca: ahi descubre el candado (_agents/hooks.json)
TRABAJO = os.environ.get("AXIOM_AGY_TRABAJO") or os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "simuladorpro-agy")
AGY = os.path.join(os.path.expanduser("~"), "AppData", "Local", "agy", "bin", "agy.exe")
NODE_MODULES = os.path.join(REPO, "node_modules")

MODELOS = {"mecanico": "Gemini 3.8 Flash (Low)",
           "lectura": "Gemini 3.8 Flash (Medium)",
           "criterio": "Gemini 4 Argon (Medium)",
           "criterio-alto": "Gemini 4 Argon (High)"}
# 13-11: la tabla de modelos es UNICA y vive en la central (_AGENTES_CENTRAL\motor_agy\MODELOS.json: titular + suplentes por nivel,
# con la cuota anotada POR MODELO). Si la central no esta a mano, vale la tabla de arriba.
try:
    # 18-11: en una PC la central esta en SynologyDrive/12.NUBES, en la otra en SynologyDrive directo: se prueban las dos
    # (sin esto, en RonMarty-9fb9 no habia escalera de modelos ni cuentas: agy se quedaba en el modelo agotado).
    for _c in ([os.environ.get("AGENTES_CENTRAL_MOTOR")] if os.environ.get("AGENTES_CENTRAL_MOTOR") else []) + [
            os.path.join(os.path.expanduser("~"), "SynologyDrive", "12.NUBES", "_AGENTES_CENTRAL", "motor_agy"),
            os.path.join(os.path.expanduser("~"), "SynologyDrive", "_AGENTES_CENTRAL", "motor_agy")]:
        if os.path.exists(os.path.join(_c, "modelos.py")):
            sys.path.insert(0, _c); break
    import modelos as _mod
    MODELOS = dict(MODELOS, **_mod.titulares())
except Exception:
    _mod = None
try:      # 13-11: vigilante central (mira la corrida, deja AVANCE.txt y corta si agy se pierde); sin la central, se corre como antes
    import vigilante as _vig
except Exception:
    _vig = None
try:      # 18-11 (Ronald: «una de las ventanas dice que agy no funciona»): las DOS cuentas de agy se turnan, igual que en el motor central
    import cuentas as _cuentas
except Exception:
    _cuentas = None


def _cuenta_para(nivel, previa=""):
    try:
        if not _cuentas:
            return ""
        forzada = os.environ.get("AGY_CUENTA_FORZADA", "")
        c = _cuentas.para_lanzar(nivel, forzada or previa, lambda n, x: bool(_mod and n and _mod.elegir_en(n, x)))
        if c:
            os.environ["AGY_CUENTA_CONSULTA"] = c
            if len(_cuentas.guardadas()) == 2:
                print(f"[cuentas de agy: este pedido sale con la cuenta {c}]", file=sys.stderr)
        return c
    except BaseException as e:
        print(f"[cuentas de agy: no se pudo elegir cuenta ({e}); sigue la que estaba]", file=sys.stderr)
        return ""
CONTROLES_DEFAULT = ['npm run typecheck', 'npm run lint', 'npm test']

REGLAS_AGY = """
REGLAS FIJAS (no negociables):
1. Solo puedes crear o editar archivos dentro de: {repo}
   Es una copia aislada del repo de simuladorpro. El resto del disco se puede LEER, nunca modificar.
   LA TERMINAL ESTA BLOQUEADA: no uses run_command. Usa SOLO herramientas de archivos:
   list_dir, find_by_name, grep_search, view_file, write_to_file, replace_file_content.
   Si una accion es denegada, NO te detengas: sigue con las herramientas de archivos hasta terminar.
   Los controles (tsc, lint, tests) los corre el ejecutor despues; escribe el codigo para que pasen.
2. Lee CLAUDE.md y docs/lecciones-agentes.md del repo antes de empezar.
3. Texto al alumno en tuteo (nunca voseo). Sin emojis en codigo. Cero cifras de catalogo escritas a mano.
4. No inventes datos. Si no sabes algo, escribe "NO SE".
5. Haz SOLO lo que pide la tarea. No reformatees ni "mejores" lo que no se pidio. No hagas commit.
{regla6}
"""
REGLA6_EDITA = ("6. Al terminar, escribe ENTREGA_AGY.md en la raiz de la copia con: (a) que hiciste, (b) archivos que cambiaste,\n"
                "   (c) que comprobaste, (d) dudas o lo que no pudiste hacer. Breve.")
REGLA6_TEXTO = ("6. Este pedido es SOLO LECTURA (modo plan): NO tienes permiso de escribir archivos, no uses write_file ni ENTREGA_AGY.md.\n"
                "   Entrega el informe COMPLETO como texto en tu respuesta final.")


def git(*args, cwd=REPO):
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")


def snapshot_base(rid, rutas):
    """Commit suelto (sin mover tu rama ni tu indice): HEAD + esos archivos tal como estan hoy en el arbol de trabajo.
    Sirve cuando el trabajo nuevo depende de cambios que todavia no estan commiteados."""
    idx = os.path.join(TRABAJO, f"_idx_{rid}")
    env = dict(os.environ, GIT_INDEX_FILE=idx)
    def g(*args):
        r = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env)
        if r.returncode:
            sys.exit("ALTO: fallo la base (" + " ".join(args[:2]) + "):" + chr(10) + r.stderr)
        return r.stdout.strip()
    g("read-tree", "HEAD")
    g("add", "--", *[":(literal)" + p for p in rutas])
    tree = g("write-tree")
    sha = g("commit-tree", tree, "-p", "HEAD", "-m", "base agy (HEAD + archivos sin commitear)")
    try:
        os.remove(idx)
    except OSError:
        pass
    return sha


def crear_copia(rid, base=None):
    destino = os.path.join(TRABAJO, rid, "repo")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    r = git("worktree", "add", "-b", f"agy/{rid}", destino, snapshot_base(rid, base) if base else "HEAD")
    if r.returncode:
        sys.exit("ALTO: no se pudo crear la copia aislada:\n" + r.stderr)
    # node_modules por enlace (fuera de Synology) para poder correr tsc/lint/tests dentro de la copia
    if os.path.isdir(NODE_MODULES):
        subprocess.run(["cmd", "/c", "mklink", "/J", os.path.join(destino, "node_modules"), NODE_MODULES], capture_output=True)
    return destino


def diff_de(repo):
    git("add", "-N", ".", cwd=repo)                     # que los archivos nuevos aparezcan en el diff
    estado = [l[3:] for l in git("status", "--porcelain", cwd=repo).stdout.splitlines()
              if l[3:] and not l[3:].startswith("node_modules") and l[3:] != "ENTREGA_AGY.md"]
    return estado, git("diff", "--no-color", "--", ".", ":(exclude)ENTREGA_AGY.md", cwd=repo).stdout


def verificar_entrega(carpeta, pedido_txt, res, modelo, suf=""):
    """Alertas baratas sobre la entrega (propuesta_motor_axiom.md): agente nombrado y no abierto, respuesta corta, cuota de Argon."""
    alertas = []
    try:
        citados = set(re.findall(r"(?:skill|agente)\s+[`'\"]([\w-]+)[`'\"]", pedido_txt or "", re.I)) - {"ejecutor-agy"}
        jl = os.path.join(carpeta, f"run{suf}.jsonl")
        abiertos = set()
        if citados and os.path.exists(jl):
            for l in open(jl, encoding="utf-8", errors="replace"):
                if "view_file" in l or "read_file" in l:
                    for ag in citados:
                        if ag in l and ("SKILL.md" in l or ag + ".md" in l):
                            abiertos.add(ag)
        alertas += [f"AGENTE NO CARGADO: {ag}" for ag in sorted(citados - abiertos)]
        if res.get("status") == "SUCCESS" and len((res.get("response") or "").strip()) < 80:
            alertas.append("RESPUESTA MUY CORTA CON SUCCESS")
        if ("429" in str(res.get("finished_reason", "")) or "RESOURCE_EXHAUSTED" in str(res)[:2000]) and "Argon" in modelo:
            alertas.append("RELANZAR CON FLASH MEDIUM: cuota agotada en Argon")
    except Exception as e:
        alertas.append(f"(verificador con error: {e})")
    return alertas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tipo", default="")
    ap.add_argument("--nivel", default="", choices=[""] + list(MODELOS))
    ap.add_argument("--pedido", required=True)
    ap.add_argument("--leer", action="append", default=[], help="carpeta de SOLO LECTURA fuera de la copia (repetible); sin esto agy no puede leer lo que este fuera")
    ap.add_argument("--base", action="append", default=[], help="archivo del arbol de trabajo (sin commitear) que la copia debe traer ya puesto (repetible)")
    ap.add_argument("--despues", action="append", default=[])
    ap.add_argument("--solo-texto", action="store_true")
    ap.add_argument("--tocar", action="append", default=[], help="18-11 CANDADO: archivo o patron del repo que agy PUEDE cambiar (repetible); aplicar.py rechaza lo que quede fuera")
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--seguir", default="", help="id de una entrega: corrige en LA MISMA conversacion de agy")
    a = ap.parse_args()

    if not os.path.exists(os.path.join(ARRANQUE, "_agents", "hooks.json")):
        sys.exit("ALTO: falta el candado (scripts/agy/arranque/_agents/hooks.json). No se corre agy sin candado.")

    previo, vuelta = None, 1
    if a.seguir:
        carpeta = os.path.join(TRABAJO, a.seguir)
        previo = json.load(open(os.path.join(carpeta, "ENTREGA.json"), encoding="utf-8"))
        if not previo.get("conversation_id"):
            sys.exit("ALTO: esa entrega no guardo conversation_id. Haz un pedido nuevo.")
        vuelta = len(previo.get("vueltas") or []) + 2
        rid = f"{a.seguir}_v{vuelta}"
        repo = os.path.join(carpeta, "repo")
        a.despues = a.despues or previo.get("despues") or []
        a.solo_texto = a.solo_texto or previo.get("solo_texto", False)
        a.tipo = a.tipo or previo.get("tipo", "")
    else:
        if not a.tipo or not a.nivel:
            sys.exit("Falta --tipo y --nivel (solo se pueden omitir con --seguir).")
        rid = datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + "_" + a.tipo
        carpeta = os.path.join(TRABAJO, rid)
        os.makedirs(carpeta, exist_ok=True)
        repo = crear_copia(rid, a.base)
    suf = f"_v{vuelta}" if vuelta > 1 else ""
    controles_a_correr = a.despues or ([] if a.solo_texto else CONTROLES_DEFAULT)

    pedido = open(a.pedido, encoding="utf-8").read()
    try:   # 18-11: candados de edicion (central motor_agy/alcance.py)
        import alcance as _alc
        if a.tocar:
            _alc.guardar(carpeta, a.tocar)
        pedido = _alc.texto_para_agy(_alc.leer(carpeta)) + pedido
    except ImportError:
        print("[!] sin motor central: no hay candado de alcance para esta entrega")
    # 15-11 noche (copiloto; 2 entregas vacias en Audiolibros: «file does not exist»): lo que .gitignore excluye (ej. examenes pasados/
    # MEDICINA) NO esta en la copia de agy. Si el pedido nombra rutas que existen en el repo real y faltan en la copia, se agregan solas
    # como --leer (solo lectura) y se le dice a agy donde leerlas. Vale para toda ventana y todo pedido, no solo para el audio.
    faltan = []
    for m_ in re.findall(r"[\w .\-]+(?:[/\\][\w .\-]+)+[/\\]?", pedido):     # \w ya incluye tildes
        rel = m_.strip().strip("/\\").replace("\\", "/")
        if not rel or os.path.isabs(rel) or ":" in rel:
            continue
        real, copia = os.path.join(REPO, rel), os.path.join(repo, rel)
        if os.path.exists(real) and not os.path.exists(copia):
            d_ = os.path.normpath(real if os.path.isdir(real) else os.path.dirname(real))
            if d_ not in faltan and os.path.normcase(d_) not in [os.path.normcase(x) for x in a.leer]:
                faltan.append(d_)
    if faltan:
        a.leer += faltan
        print("[--leer agregado solo: el pedido nombra carpetas que no viajan a la copia (gitignore): " + "; ".join(faltan) + "]", file=sys.stderr)
        pedido += ("\n\nOJO: estas carpetas NO estan en tu copia (las excluye .gitignore). Leelas en su ruta REAL, solo lectura: "
                   + "; ".join(faltan) + "\n")
    if previo:
        texto = (f"CORRECCION de Claude sobre tu entrega anterior (misma tarea, mismas reglas, misma copia {repo}). "
                 f"Corrige SOLO esto:\n\n{pedido}\n\n"
                 + ("Entrega el resultado como texto en tu respuesta final (no escribas archivos)." if a.solo_texto
                    else f"Al terminar, agrega una seccion 'Vuelta {vuelta}' a ENTREGA_AGY.md."))
    else:
        texto = pedido + "\n" + REGLAS_AGY.format(repo=repo, regla6=REGLA6_TEXTO if a.solo_texto else REGLA6_EDITA)
    with open(os.path.join(carpeta, f"PEDIDO{suf}.md"), "w", encoding="utf-8") as f:
        f.write(texto)

    cuenta = _cuenta_para(a.nivel or (previo or {}).get("nivel", ""), (previo or {}).get("cuenta", ""))
    modelo = previo["modelo"] if previo and not a.nivel else MODELOS[a.nivel]
    if _mod and not (previo and not a.nivel):      # 13-11: titular anotado sin cuota -> primer suplente con cuota
        _eleg = _mod.elegir(a.nivel)
        if _eleg and _eleg != modelo:
            print(f"[escalera de modelos: {modelo} esta sin cuota; se usa el suplente {_eleg}]", file=sys.stderr)
            modelo = _eleg
    cmd = [AGY, "--sandbox", "--model", modelo, "--mode", "plan" if a.solo_texto else "accept-edits",
           "--output-format", "stream-json", "--print-timeout", f"{a.timeout}s", "-p", texto]
    if previo:
        cmd[1:1] = ["--conversation", previo["conversation_id"]]
    for p_ in a.leer + [repo]:
        cmd[1:1] = ["--add-dir", p_]
    env = dict(os.environ, AXIOM_AGY_TRABAJO=TRABAJO)

    def correr(cmd_, archivo):
        if _vig:
            p = _vig.correr(cmd_, ARRANQUE, archivo, env)
        else:
            with open(archivo, "w", encoding="utf-8") as out:
                p = subprocess.run(cmd_, cwd=ARRANQUE, stdout=out, stderr=subprocess.STDOUT, env=env)
        r_, errs = {}, []
        for linea in open(archivo, encoding="utf-8", errors="replace"):
            try:
                e = json.loads(linea)
            except Exception:
                continue
            if e.get("event") == "result":
                r_ = e.get("result", {})
            su = e.get("step_update") or {}
            for err in (su.get("error"), (su.get("tool_info") or {}).get("error")):
                if isinstance(err, dict):
                    errs.append(err.get("message", "")[:200])
        return p, r_, errs

    t0 = time.time()
    proc, res, errores = correr(cmd, os.path.join(carpeta, f"run{suf}.jsonl"))
    tokens_total = (res.get("usage") or {}).get("total_tokens") or 0
    cambiados, _ = diff_de(repo)
    reintento = False
    if not previo and not a.solo_texto and not cambiados and errores and "vigilante" not in str(res.get("finished_reason")):
        reintento = True      # una sola vez; gasta cuota de Gemini, no de Claude
        aviso = ("\n\nATENCION: en tu intento anterior usaste la terminal, fue BLOQUEADA y te detuviste sin hacer la tarea. "
                 "Errores: " + " | ".join(errores[:2]) + "\nHazla ahora usando SOLO herramientas de archivos.")
        proc, res, errores2 = correr(cmd[:-1] + [cmd[-1] + aviso], os.path.join(carpeta, "run2.jsonl"))
        errores += ["[reintento] " + x for x in errores2]
        tokens_total += (res.get("usage") or {}).get("total_tokens") or 0
    cortada = str(res.get("finished_reason") or "")
    if (a.solo_texto or cortada) and not (res.get("response") or "").strip() and res.get("conversation_id"):
        # respaldo (propuesta_motor_axiom.md): respuesta vacia en modo texto -> una vez, misma conversacion, Flash Medium.
        # 13-11 RESCATE: tambien si la corrida fue CORTADA (tiempo o vigilante) y vino vacia: 5 min para que entregue lo que ya tiene.
        reintento = True
        pide = ("Tu respuesta anterior salio VACIA. No escribas archivos (se niegan). Pega AHORA, como texto en este mensaje, "
                "el informe completo con el formato pedido; si no terminaste, entrega lo que ya tienes y lista lo que falta.")
        if cortada:
            pide = ("Tu trabajo fue CORTADO (" + cortada[:150] + ") y tu respuesta salio VACIA. NO leas ni busques nada mas y no sigas la tarea. "
                    "Pega AHORA, como texto en este mensaje: (a) que alcanzaste a hacer y en que archivos, (b) que encontraste, "
                    "(c) que falta exactamente, (d) por que no terminaste. Nunca vacia.")
        cmd_r = [AGY, "--sandbox", "--model", MODELOS["lectura"], "--mode", "plan", "--output-format", "stream-json",
                 "--print-timeout", "300s" if cortada else f"{a.timeout}s", "--conversation", res["conversation_id"]]
        for p_ in a.leer + [repo]:
            cmd_r += ["--add-dir", p_]
        cmd_r += ["-p", pide]
        proc, res2, errores2 = correr(cmd_r, os.path.join(carpeta, f"run{suf}_texto.jsonl"))
        errores += ["[respaldo texto] " + x for x in errores2]
        tokens_total += (res2.get("usage") or {}).get("total_tokens") or 0
        if (res2.get("response") or "").strip():
            res = res2
            if cortada:      # el rescate es un informe parcial: el estado sigue diciendo que la tarea NO termino
                res = dict(res2, status="ERROR", finished_reason=cortada + " · LA TAREA NO TERMINO · RESCATE (informe parcial)")
    minutos = round((time.time() - t0) / 60, 1)
    with open(os.path.join(carpeta, f"RESPUESTA{suf}.md"), "w", encoding="utf-8") as f:
        f.write(res.get("response", "(sin respuesta: ver run.jsonl)"))

    # --- controles mecanicos, por script (cero modelo)
    salidas = []
    for c in controles_a_correr:
        r = subprocess.run(c, cwd=repo, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
        salidas.append(f"$ {c}\n[codigo {r.returncode}]\n{(r.stdout + r.stderr)[-4000:]}")
    if salidas:
        with open(os.path.join(carpeta, "CONTROLES.txt"), "w", encoding="utf-8") as f:
            f.write("\n\n".join(salidas))
    cambiados, diff = diff_de(repo)
    with open(os.path.join(carpeta, "DIFF.txt"), "w", encoding="utf-8") as f:
        f.write(diff or "(sin cambios)")

    estado = res.get("status", f"SIN RESULTADO (codigo {proc.returncode})")
    if res.get("finished_reason"):
        estado += " CORTADA: " + str(res["finished_reason"])
    if res.get("denied_actions"):
        estado += " CON ACCIONES NEGADAS: " + ", ".join(str(x.get("action")) for x in res["denied_actions"])
    if not (res.get("response") or "").strip():
        estado += " RESPUESTA VACIA"
    if not a.solo_texto and not cambiados:
        estado += " PERO NO CREO NI CAMBIO NADA"
    _err = " ".join(str(e) for e in errores) + " " + str(res.get("error", ""))
    if "quota" in _err.lower() or "429" in _err or "quota" in (res.get("response") or "").lower():
        estado += " SIN CUOTA EN ESTE MODELO: quedo anotado; RELANZA el mismo comando y el motor usara el suplente"
        if _mod:
            _mod.marcar(modelo, _err)
        # 18-11: la cuota se acabo al arrancar (0 tokens): se repite SOLO, primero con la otra cuenta, luego con el suplente (tope 3)
        if _mod and not tokens_total and not previo and a.nivel:
            _saltos = int(os.environ.get("AGY_SALTOS", "0"))
            _otra = _cuentas.otra_de(cuenta) if (_cuentas and cuenta) else ""
            _sig = _mod.elegir(a.nivel)
            if _otra and _mod.elegir_en(a.nivel, _otra) and not os.environ.get("AGY_CUENTA_FORZADA") and _saltos < 3:
                print(f"[cuentas de agy: la cuenta {cuenta} no tiene cuota para {a.nivel}; se repite con la cuenta {_otra}]", file=sys.stderr)
                raise SystemExit(subprocess.run([sys.executable, os.path.abspath(__file__)] + sys.argv[1:],
                                                env=dict(os.environ, AGY_CUENTA_FORZADA=_otra, AGY_CUENTA_CONSULTA=_otra,
                                                         AGY_SALTOS=str(_saltos + 1))).returncode)
            if _sig and _sig != modelo and _saltos < 3:
                print(f"[escalera de modelos: {modelo} sin cuota (anotado); se repite con {_sig}]", file=sys.stderr)
                raise SystemExit(subprocess.run([sys.executable, os.path.abspath(__file__)] + sys.argv[1:],
                                                env=dict(os.environ, AGY_SALTOS=str(_saltos + 1))).returncode)
    estado += "".join(" | " + x for x in verificar_entrega(carpeta, pedido, res, modelo, suf))
    vueltas = list((previo or {}).get("vueltas") or [])
    if previo:
        vueltas.append({"id": rid, "estado_agy": estado, "minutos": minutos, "errores_agy": errores})
    entrega = {"id": a.seguir or rid, "estado_agy": estado, "reintento": reintento, "errores_agy": errores, "modelo": modelo, "cuenta": cuenta, "nivel": a.nivel or (previo or {}).get("nivel", ""),
               "minutos": minutos, "tokens_agy": tokens_total, "archivos_cambiados": cambiados,
               "controles": [s.splitlines()[0] + " " + s.splitlines()[1] for s in salidas],
               "revisar": ["DIFF.txt", "CONTROLES.txt", "ENTREGA_AGY.md (en repo/)"],
               "veredicto": "NO VERIFICADO (falta revision de Claude)",
               "conversation_id": res.get("conversation_id") or (previo or {}).get("conversation_id"),
               "tipo": a.tipo, "despues": a.despues, "solo_texto": a.solo_texto, "vuelta": vuelta, "vueltas": vueltas}
    tmp = os.path.join(carpeta, "ENTREGA.json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(entrega, f, ensure_ascii=False, indent=2)
    os.replace(tmp, os.path.join(carpeta, "ENTREGA.json"))
    print(json.dumps(entrega, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
