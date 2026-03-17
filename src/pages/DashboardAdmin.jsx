import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {

  const navigate = useNavigate();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6 md:p-10">

      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🐾 Dr Tosa
          </h2>

          <p className="text-gray-600 text-lg">
            Painel do Administrador
          </p>
        </div>

        <div className="text-gray-500 mt-4 md:mt-0">
          {hoje}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        <div
          onClick={() => navigate("/admin/ordem")}
          className="relative col-span-1 md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all cursor-pointer text-white overflow-hidden"
        >

          <div className="text-6xl mb-4">📝</div>

          <h3 className="text-2xl font-bold mb-2">
            Nova Ordem de Serviço
          </h3>

          <p className="text-white/90">
            Registrar novo atendimento
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/ordens")}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">📋</div>

          <h3 className="text-xl font-bold">
            Ordens Pendentes
          </h3>

          <p className="text-white/90">
            Ver Ordens Pendentes
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/ordensfinalizadas")}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">📑</div>

          <h3 className="text-xl font-bold">
            Ordens Finalizadas
          </h3>

          <p className="text-white/90">
            Ver Ordens Finalizadas
          </p>

        </div>

        {/* <div
          onClick={() => navigate("/admin/financeiro")}
          className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">💰</div>

          <h3 className="text-xl font-bold">
            Gestão Financeira
          </h3>

          <p className="text-white/90">
            Pagar e receber
          </p>

        </div> */}

        <div
          onClick={() => navigate("/admin/movimentacoes")}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">💳</div>

          <h3 className="text-xl font-bold">
            Movimentações Financeiras
          </h3>

          <p className="text-white/90">
            Entradas e saídas do sistema
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/despesas")}
          className="bg-gradient-to-r from-red-500 to-rose-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">💸</div>

          <h3 className="text-xl font-bold">
            Despesas e Vales
          </h3>

          <p className="text-white/90">
            Registrar despesas e vales de funcionários
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/clientes/buscar")}
          className="bg-gradient-to-r from-purple-500 to-violet-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">👥</div>

          <h3 className="text-xl font-bold">
            Gerenciar Clientes
          </h3>

          <p className="text-white/90">
            Veja tudo sobre seus clientes
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/clientes")}
          className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">➕</div>

          <h3 className="text-xl font-bold">
            Cadastrar Cliente
          </h3>

          <p className="text-white/90">
            Cadastre um novo cliente
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/funcionarios")}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">👨‍🔧</div>

          <h3 className="text-xl font-bold">
            Funcionários
          </h3>

          <p className="text-white/90">
            Gerencie seus funcionários
          </p>

        </div>

        <div
          onClick={() => navigate("/admin/grafico")}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.04] transition-all cursor-pointer text-white"
        >

          <div className="text-5xl mb-3">📊</div>

          <h3 className="text-xl font-bold">
            Gráfico Financeiro
          </h3>

          <p className="text-white/90">
            Veja os resultados de cada mês
          </p>

        </div>

      </div>

      <div className="mt-16 flex justify-center">

        <button
          onClick={() => navigate("/")}
          className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-lg"
        >
          🚪 Sair do Sistema
        </button>

      </div>

    </div>

  );

}