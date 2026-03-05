import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardEquipe from "./pages/DashboardEquipe";
import CadastrarCliente from "./pages/CadastrarCliente";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import NovaOrdem from "./pages/NovaOrdem";
import AdminFinalizadas from "./pages/AdminFinalizadas";
import TrocarSenha from "./pages/TrocarSenha";
import AdminClientes from "./pages/AdminClientes";
import HistoricoCliente from "./pages/HistoricoCliente";
import AdminGraficoFinanceiro from "./pages/AdminGraficoFinanceiro";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/clientes" element={<CadastrarCliente />} />
        <Route path="/admin/funcionarios" element={<CadastrarFuncionario />} />
        <Route path="/admin/ordem" element={<NovaOrdem />} />
        <Route path="/admin/finalizadas" element={<AdminFinalizadas />} />
        <Route path="/equipe" element={<DashboardEquipe />} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
        <Route path="/admin/clientes/buscar" element={<AdminClientes />} />
        <Route path="/admin/historico/:id" element={<HistoricoCliente />} />
        <Route path="/admin/grafico" element={<AdminGraficoFinanceiro />} />
      </Routes>
    </BrowserRouter>
  );
}