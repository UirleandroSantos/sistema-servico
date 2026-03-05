import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10">

      <h2 className="text-4xl font-bold mb-12 text-gray-800">
        🐾 Painel do Administrador
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* NOVA ORDEM */}
        <div
          onClick={() => navigate("/admin/ordem")}
          className="col-span-1 md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 p-10 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >
          <div className="text-5xl mb-4">📝</div>

          <h3 className="text-2xl font-bold mb-2">
            Nova Ordem de Serviço
          </h3>

          <p className="opacity-90">
            Registrar novo atendimento no sistema
          </p>

        </div>

        {/* SERVIÇOS */}
        <div
          onClick={() => navigate("/admin/finalizadas")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">📋</div>

          <h3 className="text-xl font-bold mb-1">
            Gerenciar Serviços
          </h3>

          <p className="opacity-90">
            Pendentes e Finalizados
          </p>

        </div>

        {/* CLIENTES */}
        <div
          onClick={() => navigate("/admin/clientes/buscar")}
          className="bg-gradient-to-r from-purple-500 to-violet-600 p-8 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">👥</div>

          <h3 className="text-xl font-bold mb-1">
            Gerenciar Clientes
          </h3>

          <p className="opacity-90">
            Buscar, editar e histórico
          </p>

        </div>

        {/* CADASTRAR CLIENTE */}
        <div
          onClick={() => navigate("/admin/clientes")}
          className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">➕</div>

          <h3 className="text-xl font-bold mb-1">
            Cadastrar Cliente
          </h3>

          <p className="opacity-90">
            Adicionar novo cliente
          </p>

        </div>

        {/* FUNCIONARIOS */}
        <div
          onClick={() => navigate("/admin/funcionarios")}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">👨‍🔧</div>

          <h3 className="text-xl font-bold mb-1">
            Funcionários
          </h3>

          <p className="opacity-90">
            Gerenciar equipe
          </p>

        </div>

        {/* GRAFICO */}
        <div
          onClick={() => navigate("/admin/grafico")}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition cursor-pointer text-white"
        >

          <div className="text-4xl mb-3">📊</div>

          <h3 className="text-xl font-bold mb-1">
            Gráfico Financeiro
          </h3>

          <p className="opacity-90">
            Faturamento da empresa
          </p>

        </div>

      </div>

      {/* BOTÃO SAIR */}

      <div className="mt-14">

        <button
          onClick={() => navigate("/")}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl shadow-lg transition"
        >
          🚪 Sair do Sistema
        </button>

      </div>

    </div>

  );

}