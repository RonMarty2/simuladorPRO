import * as Sentry from "@sentry/react";

/**
 * Inicializa Sentry SOLO si está configurado el DSN en las variables de
 * entorno (VITE_SENTRY_DSN). Si no está, no hace nada — la app funciona
 * idéntico. Así el código queda listo y se "enciende" cuando agregues el DSN
 * de tu proyecto Sentry en Vercel, sin tocar más código.
 *
 * Pasos para activarlo (una vez):
 *  1. Crear cuenta gratis en https://sentry.io y un proyecto tipo "React".
 *  2. Copiar el DSN que te da (algo como https://xxxx@oyyy.ingest.sentry.io/zzz).
 *  3. En Vercel → tu proyecto → Settings → Environment Variables, agregar:
 *       VITE_SENTRY_DSN = (el DSN)
 *  4. Redeploy. Listo: los errores de los alumnos te llegan a Sentry.
 */
export function inicializarSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // sin DSN, no se activa (desarrollo o no configurado)

  Sentry.init({
    dsn,
    // Solo en producción (no queremos ruido de errores de desarrollo).
    environment: import.meta.env.MODE,
    // Captura errores no manejados y promesas rechazadas automáticamente.
    integrations: [
      Sentry.browserTracingIntegration(),
      // Session Replay: graba un "video" liviano de lo que hizo el usuario
      // antes del error. Solo se sube cuando hay error (errorSampleRate: 1).
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Muestreo de performance: 10% de las navegaciones (suficiente, barato).
    tracesSampleRate: 0.1,
    // Replays: 0% de sesiones normales, 100% de las que tuvieron un error.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}
