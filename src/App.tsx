import { Navigate, Route, Routes } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import Login from "@/routes/login";
import DashboardEstudiante from "@/routes/dashboard-estudiante";
import DashboardDocente from "@/routes/dashboard-docente";
import ConstruirProyecto from "@/routes/construir-proyecto";
import SimularProyecto from "@/routes/simular-proyecto";
import EvaluacionFinal from "@/routes/evaluacion-final";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RootLayout />}>
        <Route path="/estudiante" element={<DashboardEstudiante />} />
        <Route path="/docente" element={<DashboardDocente />} />
        <Route path="/construir" element={<ConstruirProyecto />} />
        <Route path="/simular" element={<SimularProyecto />} />
        <Route path="/evaluacion" element={<EvaluacionFinal />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
