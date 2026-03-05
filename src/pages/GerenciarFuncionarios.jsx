import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function GerenciarFuncionarios() {

  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [busca, setBusca] = useState("");

  const [editar, setEditar] = useState(null);
  const [historico, setHistorico] = useState({});
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  async function buscarFuncionarios() {

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "membro")
      .order("nome");

    setFuncionarios(data || []);
  }

  async function excluirFuncionario(id) {

    if (!confirm("Excluir funcionário?")) return;

    await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    buscarFuncionarios();
  }

  async function salvarEdicao() {

    await supabase
      .from("profiles")
      .update({
        nome: editar.nome,
        sobrenome: editar.sobrenome,
        telefone: editar.telefone,
        email: editar.email,
        comissao: editar.comissao
      })
      .eq("id", editar.id);

    setEditar(null);
    buscarFuncionarios();
  }

  async function verHistorico(id) {

    if (historico[id]) {
      setExpandido(expandido === id ? null : id);
      return;
    }

    const { data } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (nome_cliente, nome_pet)
      `)
      .eq("funcionario_id", id)
      .eq("status", "finalizado")
      .order("data_finalizacao", { ascending: false });

    setHistorico({
      ...historico,
      [id]: data
    });

    setExpandido(id);
  }

  const filtrados = funcionarios.filter((f) =>
    (f.nome + " " + f.sobrenome)
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">

      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <button
          onClick={() => navigate("/admin/funcionarios/novo")}
          className="bg-green-600 text-white px-5 py-2 rounded-xl shadow-md hover:bg-green-700"
        >
          ➕ Novo Funcionário
        </button>

      </div>

      <h2 className="text-3xl font-bold mb-8">
        👨‍🔧 Gerenciar Funcionários
      </h2>

      <input
        placeholder="Buscar funcionário..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full p-3 mb-8 border rounded-xl"
      />

      <div className="grid md:grid-cols-2 gap-6">

        {filtrados.map((f) => (

          <div
            key={f.id}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white"
          >

            <h3 className="text-xl font-bold mb-2">
              {f.nome} {f.sobrenome}
            </h3>

            <p>📞 {f.telefone}</p>
            <p>✉ {f.email}</p>
            <p>💰 Comissão: {f.comissao}%</p>

            <div className="flex gap-3 mt-4 flex-wrap">

              <button
                onClick={() => setEditar(f)}
                className="bg-white text-gray-800 px-3 py-1 rounded-lg"
              >
                ✏ Editar
              </button>

              <button
                onClick={() => excluirFuncionario(f.id)}
                className="bg-red-600 px-3 py-1 rounded-lg"
              >
                🗑 Excluir
              </button>

              <button
                onClick={() => verHistorico(f.id)}
                className="bg-blue-600 px-3 py-1 rounded-lg"
              >
                📋 Histórico
              </button>

            </div>

            {expandido === f.id && (

              <div className="mt-4 bg-white text-gray-800 p-4 rounded-xl">

                <h4 className="font-bold mb-2">
                  Serviços realizados
                </h4>

                {historico[f.id]?.length === 0 && (
                  <p>Nenhum serviço encontrado</p>
                )}

                {historico[f.id]?.map((o) => (

                  <div
                    key={o.id}
                    className="border p-2 mb-2 rounded"
                  >

                    <p><strong>Cliente:</strong> {o.clientes?.nome_cliente}</p>
                    <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
                    <p><strong>Serviço:</strong> {o.tipo_servico}</p>
                    <p><strong>Valor:</strong> R$ {o.valor}</p>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

      {editar && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">

            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ✏️ Editar Funcionário
            </h3>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-600">Nome</label>
                <input
                  value={editar.nome}
                  onChange={(e) =>
                    setEditar({ ...editar, nome: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Sobrenome</label>
                <input
                  value={editar.sobrenome}
                  onChange={(e) =>
                    setEditar({ ...editar, sobrenome: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Telefone</label>
                <input
                  value={editar.telefone}
                  onChange={(e) =>
                    setEditar({ ...editar, telefone: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  value={editar.email}
                  onChange={(e) =>
                    setEditar({ ...editar, email: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Comissão (%)</label>
                <input
                  type="number"
                  value={editar.comissao}
                  onChange={(e) =>
                    setEditar({ ...editar, comissao: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={() => setEditar(null)}
                className="px-5 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition shadow-md"
              >
                Salvar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}