import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RootLayout from "@/components/layout/RootLayout";
// Login y Registro NO son lazy: son la primera pantalla, deben pintar rápido.
import Login from "@/routes/login";
import Registro from "@/routes/registro";

// El resto de rutas se cargan bajo demanda (code-splitting). Esto saca del
// bundle inicial las librerías pesadas que solo viven en algunas rutas:
//   - recharts (gráficos) → simular-proyecto, evaluacion-final, construir
//   - xlsx → se carga dinámicamente al exportar (ver Paso9Resumen)
// Resultado: arranque más rápido, sobre todo en celulares con 4G.
const Hub = lazy(() => import("@/routes/hub"));
const DashboardEstudiante = lazy(() => import("@/routes/dashboard-estudiante"));
const DashboardDocente = lazy(() => import("@/routes/dashboard-docente"));
const ConstruirProyecto = lazy(() => import("@/routes/construir-proyecto"));
const SimularProyecto = lazy(() => import("@/routes/simular-proyecto"));
const EvaluacionFinal = lazy(() => import("@/routes/evaluacion-final"));
const CatalogoEventos = lazy(() => import("@/routes/catalogo-eventos"));
const MisEntregas = lazy(() => import("@/routes/mis-entregas"));
const GaleriaEjemplos = lazy(() => import("@/routes/galeria-ejemplos"));
const AdminPanel = lazy(() => import("@/routes/admin"));
const MiPerfil = lazy(() => import("@/routes/mi-perfil"));

function Cargando() {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Cargando…
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<Cargando />}>
                <Hub />
              </Suspense>
            }
          />
          <Route
            path="/estudiante"
            element={
              <Suspense fallback={<Cargando />}>
                <DashboardEstudiante />
              </Suspense>
            }
          />
          <Route
            path="/docente"
            element={
              <Suspense fallback={<Cargando />}>
                <DashboardDocente />
              </Suspense>
            }
          />
          <Route
            path="/construir"
            element={
              <Suspense fallback={<Cargando />}>
                <ConstruirProyecto />
              </Suspense>
            }
          />
          <Route
            path="/simular"
            element={
              <Suspense fallback={<Cargando />}>
                <SimularProyecto />
              </Suspense>
            }
          />
          <Route
            path="/evaluacion"
            element={
              <Suspense fallback={<Cargando />}>
                <EvaluacionFinal />
              </Suspense>
            }
          />
          <Route
            path="/eventos"
            element={
              <Suspense fallback={<Cargando />}>
                <CatalogoEventos />
              </Suspense>
            }
          />
          <Route
            path="/mis-entregas"
            element={
              <Suspense fallback={<Cargando />}>
                <MisEntregas />
              </Suspense>
            }
          />
          <Route
            path="/ejemplos"
            element={
              <Suspense fallback={<Cargando />}>
                <GaleriaEjemplos />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<Cargando />}>
                <AdminPanel />
              </Suspense>
            }
          />
          <Route
            path="/perfil"
            element={
              <Suspense fallback={<Cargando />}>
                <MiPerfil />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <Suspense fallback={<Cargando />}>
            <Hub />
          </Suspense>
        }
      />
    </Routes>
  );
}
