import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10">

      <h2 className="text-4xl font-bold mb-12 text-gray-800">
        🐾 Painel do Administrador
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div
          onClick={() => navigate("/admin/ordem")}
          className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 p-10 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-5xl mb-4">📝</div>

          <h3 className="text-2xl font-bold mb-2">
            Nova Ordem de Serviço
          </h3>

          <p>Registrar novo atendimento</p>

        </div>

        <div
          onClick={() => navigate("/admin/ordens")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">📋</div>

          <h3 className="text-xl font-bold">
            Gerenciar Serviços
          </h3>

          <p>Pendentes e Finalizados</p>

        </div>

        <div
          onClick={() => navigate("/admin/clientes/buscar")}
          className="bg-gradient-to-r from-purple-500 to-violet-600 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">👥</div>

          <h3 className="text-xl font-bold">
            Gerenciar Clientes
          </h3>

        </div>

        <div
          onClick={() => navigate("/admin/clientes")}
          className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">➕</div>

          <h3 className="text-xl font-bold">
            Cadastrar Cliente
          </h3>

        </div>

        <div
          onClick={() => navigate("/admin/funcionarios")}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">👨‍🔧</div>

          <h3 className="text-xl font-bold">
            Funcionários
          </h3>

        </div>

        <div
          onClick={() => navigate("/admin/grafico")}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">📊</div>

          <h3 className="text-xl font-bold">
            Gráfico Financeiro
          </h3>

        </div>

        {/* NOVO CARD FINANCEIRO */}

        <div
          onClick={() => navigate("/admin/financeiro")}
          className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 rounded-3xl shadow-xl hover:scale-105 transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">💰</div>

          <h3 className="text-xl font-bold">
            Gestão Financeira
          </h3>

          <p>Comissões e adiantamentos</p>

        </div>

      </div>

      <div className="mt-14">

        <button
          onClick={() => navigate("/")}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl shadow-lg"
        >
          🚪 Sair do Sistema
        </button>

      </div>

    </div>

  );

}