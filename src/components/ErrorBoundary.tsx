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

  render() {
    if (!this.state.error) return this.props.children;

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
            Tu información está guardada. Recarga la página para continuar.
          </p>
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </section>
      </main>
    );
  }
}
