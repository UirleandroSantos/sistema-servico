import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import CadastrarCliente from "./pages/CadastrarCliente";
import CadastrarFuncionario from "./pages/CadastrarFuncionario";
import NovaOrdem from "./pages/NovaOrdem";
import ListaOrdens from "./pages/ListaOrdens";
import DashboardEquipe from "./pages/DashboardEquipe";
import DashboardFinanceiroAdmin from "./pages/DashboardFinanceiroAdmin";
import AdminFinalizadas from "./pages/AdminFinalizadas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/clientes" element={<CadastrarCliente />} />
        <Route path="/admin/funcionarios" element={<CadastrarFuncionario />} />
        <Route path="/admin/ordem" element={<NovaOrdem />} />
        <Route path="/admin/ordens-lista" element={<ListaOrdens />} />
        <Route path="/equipe" element={<DashboardEquipe />} />
        <Route path="/admin/financeiro" element={<DashboardFinanceiroAdmin />} />
        <Route path="/admin/finalizadas" element={<AdminFinalizadas />} />
      </Routes>
    </BrowserRouter>
  );
}