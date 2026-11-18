# -*- coding: utf-8 -*-
"""Candado de agy para Axiom (adaptado de ejecutor-agy de UNIFRANZ, 1-nov-2026). Hook PreToolUse: decide ANTES de que corra la herramienta.

agy solo lo carga si ARRANCA en scripts/agy/arranque/, y eso lo hace agy_run.py. Por eso esta siempre activo en el trabajo delegado.

Reglas:
  - Escribir, editar, borrar o mover: SOLO dentro de la carpeta de trabajo (por defecto %LOCALAPPDATA%\\simuladorpro-agy). Fuera -> deny.
  - Leer, listar, buscar: permitido.
  - Terminal: bloqueada (los controles tsc/lint/test los corre agy_run.py con --despues, sin gastar modelo).
  - Navegador, subagentes, MCP: deny.
  - Si el candado falla -> deny (falla cerrado).
Todo pedido queda en <trabajo>\\_candado_log.jsonl.
"""
import sys, os, json, re, datetime

TRABAJO = os.environ.get("AXIOM_AGY_TRABAJO") or os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "simuladorpro-agy")
LOG = os.path.join(TRABAJO, "_candado_log.jsonl")

LECTURA = re.compile(r"(read|view|list|grep|find|search|glob|fetch|outline|ls$|stat)", re.I)
ESCRITURA = re.compile(r"(write|edit|replace|create|delete|remove|move|rename|copy|patch|code_action|mkdir|save|apply)", re.I)
CLAVE_RUTA = re.compile(r"(path|file|target|dir|uri|cwd|dest|source|folder)", re.I)
RUTA_ABS = re.compile(r"^([a-zA-Z]:[\\/]|\\\\|/|~)")
SIEMPRE_OK = {"finish", "wait", "wait_5_seconds", "command_status", "task_boundary", "notify_user", "ask_question",
              "ask_permission", "ask_custom_permission", "list_permissions", "view_file_outline"}
NUNCA = {"run_workflow", "schedule", "invoke_subagent", "define_subagent", "manage_subagents", "send_command_input",
         "send_message", "manage_inbox", "manage_task", "delete_knowledge", "generate_image", "call_mcp_tool",
         "execute_browser_javascript", "open_browser_url", "click_browser_pixel", "search_marketplace"}


def dentro(ruta, base):
    try:
        r = os.path.normcase(os.path.realpath(ruta))
        b = os.path.normcase(os.path.realpath(base))
        return os.path.commonpath([r, b]) == b
    except Exception:
        return False


def absoluta(v, cwd):
    v = os.path.expanduser(v.strip().strip('"').strip("'"))
    if v.lower().startswith("file:///"):
        v = v[8:]
    return v if os.path.isabs(v) else os.path.join(cwd, v)


def rutas_de(args, cwd):
    out = []

    def rec(k, v):
        if isinstance(v, dict):
            for kk, vv in v.items():
                rec(kk, vv)
        elif isinstance(v, list):
            for x in v:
                rec(k, x)
        elif isinstance(v, str) and v.strip():
            if (CLAVE_RUTA.search(k or "") and len(v) < 600 and "\n" not in v) or RUTA_ABS.match(v.strip()):
                out.append(absoluta(v, cwd))
    rec("", args)
    return out


def juzgar(nombre, args, cwd):
    n = (nombre or "").lower()
    if n == "run_command" or (n.startswith("run") and "command" in n and "terminal" not in n):
        return "deny", "Candado: la terminal esta bloqueada. Usa herramientas de archivos: list_dir, find_by_name, grep_search, view_file, write_to_file, replace_file_content. Los controles (tsc, lint, tests) los corre el ejecutor despues."
    if n.startswith("browser"):
        return "deny", "Candado: navegador bloqueado en el trabajo delegado."
    if n in NUNCA or "subagent" in n or "mcp" in n:
        return "deny", f"Candado: la herramienta {nombre} no se usa en el trabajo delegado."
    if n in SIEMPRE_OK:
        return "allow", ""
    rutas = rutas_de(args, cwd)
    if ESCRITURA.search(n) or not LECTURA.search(n):
        if not rutas:
            return "deny", f"Candado: la herramienta {nombre} no esta permitida (no se puede comprobar donde escribe)."
        fuera = [r for r in rutas if not dentro(r, TRABAJO)]
        if fuera:
            return "deny", f"Candado: solo puedes escribir dentro de {TRABAJO}. Bloqueado: {fuera[0]}"
        return "allow", ""
    return "allow", ""   # lectura (para agy una decision vacia cuenta como deny, por eso se devuelve "allow")


def main():
    crudo = sys.stdin.buffer.read().decode("utf-8", errors="replace")
    datos, decision, motivo = {}, "", ""
    try:
        datos = json.loads(crudo or "{}")
        tc = datos.get("toolCall") or {}
        cwd = (datos.get("workspacePaths") or [TRABAJO])[0]
        decision, motivo = juzgar(tc.get("name", ""), tc.get("args") or {}, cwd)
    except Exception as e:        # falla cerrado
        decision, motivo = "deny", f"Candado: error interno ({e}); por seguridad se niega."
    salida = {"decision": decision}
    if motivo:
        salida["reason"] = motivo
    try:
        os.makedirs(TRABAJO, exist_ok=True)
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps({"hora": datetime.datetime.now().isoformat(timespec="seconds"),
                                "conv": datos.get("conversationId"), "tool": (datos.get("toolCall") or {}).get("name"),
                                "args": {k: (v[:300] if isinstance(v, str) else v) for k, v in
                                         ((datos.get("toolCall") or {}).get("args") or {}).items()},
                                "decision": decision, "motivo": motivo}, ensure_ascii=False) + "\n")
    except Exception:
        pass
    sys.stdout.write(json.dumps(salida, ensure_ascii=False))


if __name__ == "__main__":
    main()
