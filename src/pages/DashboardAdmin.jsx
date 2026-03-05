import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h2 className="text-3xl font-bold mb-10 text-gray-800">
        Painel do Administrador
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div
          onClick={() => navigate("/admin/ordem")}
          className="bg-green-500 p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <h3 className="text-xl text-white font-semibold mb-2">Nova Ordem de Serviço</h3>
          <p className="text-white">Registrar novo serviço</p>
        </div>

        <div
          onClick={() => navigate("/admin/clientes")}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <h3 className="text-xl font-semibold mb-2">Cadastrar Cliente</h3>
          <p className="text-gray-500">Adicionar novo cliente ao sistema</p>
        </div>

        <div
          onClick={() => navigate("/admin/funcionarios")}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <h3 className="text-xl font-semibold mb-2">Cadastrar Funcionário</h3>
          <p className="text-gray-500">Gerenciar membros da equipe</p>
        </div>

        <div
          onClick={() => navigate("/admin/finalizadas")}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <h3 className="text-xl font-semibold mb-2">Serviços Finalizados</h3>
          <p className="text-gray-500">Consultar serviços concluídos</p>
        </div>

      </div>

      <div className="mt-12">
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition shadow-md"
        >
          Sair
        </button>
      </div>

    </div>
  );
}