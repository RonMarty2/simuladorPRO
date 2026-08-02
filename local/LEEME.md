# Usar el simulador en tu compu (modo local)

Esta carpeta tiene todo para correr el simulador en tu PC **sin Supabase, sin
credenciales y sin internet**. Ideal para probar, y para que otra IA local te
modifique el código.

En modo local:

- No pide login. Entrás directo.
- Podés usar la app como **docente** o como **estudiante**, y **cambiar de rol
  cuando quieras** con el botón flotante abajo a la derecha.
- Lo que hagas se guarda en tu navegador (no se pierde al cerrar).
- El simulador financiero anda 100% igual que la app publicada.

> Lo único que NO hay en local: varios usuarios conectados a la vez, sincronización
> entre dispositivos y el panel de admin con datos reales. Todo eso necesita Supabase.

---

## 1. Bajar el proyecto a tu PC (una sola vez)

Necesitás tener instalados **Git** (https://git-scm.com) y **Node.js LTS**
(https://nodejs.org).

Abrí una terminal (en Windows: "Símbolo del sistema" o PowerShell) y pegá:

```
git clone https://github.com/RonMarty2/simuladorPRO.git
cd simuladorPRO
```

## 2. Iniciar el simulador

- **Windows**: entrá a la carpeta `local` y hacé doble clic en **`iniciar.bat`**.
- **Mac**: doble clic en **`iniciar.command`** (si no existe, renombrá
  `iniciar.sh` a `iniciar.command`), o en la terminal: `bash local/iniciar.sh`.
- **Linux**: en la terminal, `bash local/iniciar.sh`.

La primera vez tarda un par de minutos (instala lo que necesita). Después abre
solo el navegador en `http://localhost:5173`.

Para apagarlo: cerrá la ventana negra (o Ctrl+C).

## 3. Sincronizar con GitHub

Usá **`sincronizar.bat`** (Windows) o `bash local/sincronizar.sh` (Mac/Linux).
Te da un menú:

- **Opción 1 — Traer de GitHub**: baja a tu PC lo último que haya en GitHub.
  Usalo antes de empezar a trabajar.
- **Opción 2 — Subir a GitHub**: sube tus cambios (te pide una frase corta
  describiendo qué cambiaste). Usalo cuando termines algo.

Flujo recomendado con tu IA local: **traer (1) → trabajar → subir (2)**.

---

## Preguntas frecuentes

**¿Esto toca la app publicada / producción?**
No. En local nunca se conecta a Supabase. La app de Vercel sigue igual.

**¿Puedo forzar que use Supabase real en local?**
Sí: creá un archivo `.env.local` en la raíz con `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`. Si están presentes, se apaga el modo local solo.
Para forzar modo local aun con credenciales, poné `VITE_LOCAL_MODE=true`.

**Cambié de rol y no veo mis proyectos.**
Los proyectos son de la misma "persona" local, así que se ven en los dos roles.
Si no aparece nada, creá uno nuevo desde "Construir proyecto".
