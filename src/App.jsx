import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardEquipe from "./pages/DashboardEquipe";
import CadastrarCliente from "./pages/CadastrarCliente";
import AdminClientes from "./pages/AdminClientes";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import GerenciarFuncionarios from "./pages/GerenciarFuncionarios";
import NovaOrdem from "./pages/NovaOrdem";
import AdminOrdens from "./pages/AdminOrdens";
import TrocarSenha from "./pages/TrocarSenha";
import HistoricoCliente from "./pages/HistoricoCliente";
import AdminGraficoFinanceiro from "./pages/AdminGraficoFinanceiro";
import AdminFinanceiro from "./pages/AdminFinanceiro";

import HistoricoPagamentos from "./pages/HistoricoPagamentos";
import AdminDespesas from "./pages/AdminDespesas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/clientes" element={<CadastrarCliente />} />
        <Route path="/admin/funcionarios" element={<GerenciarFuncionarios />} />
        <Route path="/admin/ordem" element={<NovaOrdem />} />
        <Route path="/admin/ordens" element={<AdminOrdens />} />
        <Route path="/equipe" element={<DashboardEquipe />} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
        <Route path="/admin/clientes/buscar" element={<AdminClientes />} />
        <Route path="/admin/historico/:id" element={<HistoricoCliente />} />
        <Route path="/admin/grafico" element={<AdminGraficoFinanceiro />} />
        <Route path="/admin/funcionarios/novo" element={<CadastrarFuncionario />} />
        <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
        <Route path="/historico-pagamentos" element={<HistoricoPagamentos />} />
        <Route path="/admin/despesas" element={<AdminDespesas />} />
      </Routes>
    </BrowserRouter>
  );
}