import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisEntregas } from "@/lib/proyecto-supabase";

/**
 * Badge en el header que muestra cuántas entregas del estudiante fueron
 * revisadas por el docente y todavía no las leyó. Click → va a /mis-entregas
 * y allí se marcan como leídas.
 *
 * Persistencia: localStorage con clave `simulador.entregasVistas.{userId}`
 * que guarda un array de IDs de entrega ya vistas. Sin migración a la BD
 * (suficientemente bueno para la mayoría de los casos; vivir con que el
 * estudiante que cambia de dispositivo verá la alerta dos veces).
 */

const claveStorage = (userId: string) => `simulador.entregasVistas.${userId}`;

export function leerEntregasVistas(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(claveStorage(userId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function marcarEntregasComoVistas(userId: string, ids: string[]) {
  if (typeof window === "undefined" || ids.length === 0) return;
  const actuales = leerEntregasVistas(userId);
  let cambio = false;
  for (const id of ids) {
    if (!actuales.has(id)) {
      actuales.add(id);
      cambio = true;
    }
  }
  if (cambio) {
    try {
      localStorage.setItem(claveStorage(userId), JSON.stringify(Array.from(actuales)));
      // Notifica a los listeners (el badge en el header) que algo cambió.
      window.dispatchEvent(new Event("simulador.entregasVistas.changed"));
    } catch {
      /* ignore */
    }
  }
}

export default function BadgeRevisionesNuevas() {
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const [pendientesVer, setPendientesVer] = useState(0);

  useEffect(() => {
    if (!user || perfil?.rol !== "estudiante") {
      setPendientesVer(0);
      return;
    }
    let cancelado = false;
    const recargar = () => {
      listarMisEntregas(user.id)
        .then((entregas) => {
          if (cancelado) return;
          const vistas = leerEntregasVistas(user.id);
          const revisadasSinVer = entregas.filter(
            (e) =>
              (e.estado === "aprobada" || e.estado === "reprobada") &&
              !vistas.has(e.id)
          );
          setPendientesVer(revisadasSinVer.length);
        })
        .catch(() => {
          if (!cancelado) setPendientesVer(0);
        });
    };
    recargar();
    // Re-revisa cuando otra parte de la app marca entregas como vistas
    // (por ejemplo, cuando el estudiante entra a /mis-entregas).
    const handler = () => recargar();
    window.addEventListener("simulador.entregasVistas.changed", handler);
    // Refresh ligero cada 60s (por si el docente revisa mientras el alumno
    // tiene la pestaña abierta).
    const id = setInterval(recargar, 60000);
    return () => {
      cancelado = true;
      window.removeEventListener("simulador.entregasVistas.changed", handler);
      clearInterval(id);
    };
  }, [user, perfil?.rol]);

  if (perfil?.rol !== "estudiante") return null;
  if (pendientesVer === 0) return null;

  return (
    <Link
      to="/mis-entregas"
      title={`Tienes ${pendientesVer} entrega${pendientesVer === 1 ? "" : "s"} revisada${pendientesVer === 1 ? "" : "s"} sin leer`}
      className="relative flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-900 transition hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
      </span>
      <Bell className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">
        {pendientesVer} {pendientesVer === 1 ? "revisión" : "revisiones"}
      </span>
      <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white sm:hidden">
        {pendientesVer}
      </span>
    </Link>
  );
}
