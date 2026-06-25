import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en la interfaz:", error, info);
  }

  limpiarYReiniciar = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (window.indexedDB?.databases) {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name);
        }
      }
    } catch {
      /* no bloquea: igual recargamos */
    }
    window.location.href = "/login";
  };

  render() {
    if (!this.state.error) return this.props.children;

    const mensaje = this.state.error?.message ?? String(this.state.error);

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            No pudimos mostrar esta pantalla
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Tu información está guardada. Probá recargar; si sigue sin entrar,
            limpiá y volvé a loguearte.
          </p>
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            onClick={() => window.location.reload()}
          >
            🔄 Recargar página
          </button>
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={this.limpiarYReiniciar}
          >
            🧹 Limpiar todo y volver a login
          </button>

          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-[11px] text-slate-500">
              Mostrar error técnico (mandalo a soporte)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-100 p-2 text-[10px] text-slate-700">
              {mensaje}
            </pre>
          </details>
        </section>
      </main>
    );
  }
}
