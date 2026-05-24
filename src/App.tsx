import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RootLayout from "@/components/layout/RootLayout";
import Login from "@/routes/login";
import Registro from "@/routes/registro";
import Hub from "@/routes/hub";
import DashboardEstudiante from "@/routes/dashboard-estudiante";
import DashboardDocente from "@/routes/dashboard-docente";
import ConstruirProyecto from "@/routes/construir-proyecto";
import SimularProyecto from "@/routes/simular-proyecto";
import EvaluacionFinal from "@/routes/evaluacion-final";
import CatalogoEventos from "@/routes/catalogo-eventos";
import MisEntregas from "@/routes/mis-entregas";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Hub />} />
          <Route path="/estudiante" element={<DashboardEstudiante />} />
          <Route path="/docente" element={<DashboardDocente />} />
          <Route path="/construir" element={<ConstruirProyecto />} />
          <Route path="/simular" element={<SimularProyecto />} />
          <Route path="/evaluacion" element={<EvaluacionFinal />} />
          <Route path="/eventos" element={<CatalogoEventos />} />
          <Route path="/mis-entregas" element={<MisEntregas />} />
        </Route>
      </Route>
      <Route path="*" element={<Hub />} />
    </Routes>
  );
}
