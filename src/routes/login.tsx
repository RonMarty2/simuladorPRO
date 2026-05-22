export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-md bg-primary" />
          <h1 className="text-lg font-semibold tracking-tight text-card-foreground">
            Simulador de Proyectos de Inversión
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Iniciar sesión — Bolivia · Cochabamba
          </p>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="text-center">Pantalla de login (FASE 0 — sin lógica todavía)</p>
          <p className="text-center text-xs">
            La autenticación se implementará en FASE 1 con Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
