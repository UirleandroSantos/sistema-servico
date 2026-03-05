import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminClientes() {

  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mostrarRanking, setMostrarRanking] = useState(false);

  const [stats, setStats] = useState({
    clientes: 0,
    pets: 0,
    ativosMes: 0
  });

  useEffect(() => {
    buscarClientes();
    carregarStats();
  }, []);

  async function buscarClientes() {

    const { data } = await supabase
      .from("clientes")
      .select(`
        *,
        ordens_servico (
          valor,
          data_finalizacao,
          status
        )
      `)
      .order("nome_cliente");

    if (!data) return;

    const clientesProcessados = data.map((c) => {

      const servicos = c.ordens_servico || [];

      // 🔥 SOMENTE SERVIÇOS FINALIZADOS
      const servicosFinalizados = servicos.filter(
        (s) => s.status === "finalizado"
      );

      const totalGasto = servicosFinalizados.reduce(
        (acc, o) => acc + Number(o.valor || 0),
        0
      );

      let ultimoServico = null;

      if (servicosFinalizados.length > 0) {

        const ordenados = [...servicosFinalizados].sort(
          (a, b) =>
            new Date(b.data_finalizacao) - new Date(a.data_finalizacao)
        );

        ultimoServico = ordenados[0].data_finalizacao;

      }

      return {
        ...c,
        totalGasto,
        ultimoServico
      };

    });

    setClientes(clientesProcessados);
  }

  async function carregarStats() {

    const { data } = await supabase
      .from("clientes")
      .select("*");

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const { data: ordens } = await supabase
      .from("ordens_servico")
      .select("data_finalizacao");

    const ativosMes = ordens?.filter((o) => {

      const d = new Date(o.data_finalizacao);

      return (
        d.getMonth() === mesAtual &&
        d.getFullYear() === anoAtual
      );

    }).length;

    setStats({
      clientes: data?.length || 0,
      pets: data?.length || 0,
      ativosMes
    });
  }

  async function excluirCliente(id) {

    if (!confirm("Excluir cliente?")) return;

    await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    buscarClientes();
    carregarStats();
  }

  async function salvarEdicao() {

    await supabase
      .from("clientes")
      .update(clienteEditando)
      .eq("id", clienteEditando.id);

    setClienteEditando(null);
    buscarClientes();
  }

  const filtrados = clientes.filter((c) =>
    `${c.nome_cliente} ${c.nome_pet} ${c.telefone}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const rankingClientes = [...clientes]
    .sort((a, b) => b.totalGasto - a.totalGasto)
    .slice(0, 10);

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">

      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate("/admin")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <div className="mb-8">

          <h2 className="text-3xl font-bold mb-4">
            👥 Clientes
          </h2>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/admin/cadastrarcliente")}
              className="bg-green-600 text-white px-5 py-2 rounded-xl shadow hover:bg-green-700"
            >
              ➕ Novo Cliente
            </button>

            <button
              onClick={() => setMostrarRanking(true)}
              className="bg-yellow-500 text-white px-5 py-2 rounded-xl shadow hover:bg-yellow-600"
            >
              🏆 Ranking
            </button>

          </div>

        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500">Clientes</p>
            <h3 className="text-3xl font-bold">
              {stats.clientes}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500">Pets cadastrados</p>
            <h3 className="text-3xl font-bold">
              {stats.pets}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500">Serviços no mês</p>
            <h3 className="text-3xl font-bold">
              {stats.ativosMes}
            </h3>
          </div>

        </div>

        <input
          placeholder="Buscar cliente, pet ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-3 border rounded-xl mb-8 focus:ring-2 focus:ring-blue-400"
        />

        <div className="grid md:grid-cols-2 gap-6">

          {filtrados.map((c) => (

            <div
              key={c.id}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >

              {clienteEditando?.id === c.id ? (

                <div className="space-y-3">

                  <input
                    value={clienteEditando.nome_cliente}
                    onChange={(e) =>
                      setClienteEditando({
                        ...clienteEditando,
                        nome_cliente: e.target.value
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />

                  <input
                    value={clienteEditando.nome_pet}
                    onChange={(e) =>
                      setClienteEditando({
                        ...clienteEditando,
                        nome_pet: e.target.value
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />

                  <input
                    value={clienteEditando.telefone || ""}
                    onChange={(e) =>
                      setClienteEditando({
                        ...clienteEditando,
                        telefone: e.target.value
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />

                  <input
                    value={clienteEditando.endereco || ""}
                    onChange={(e) =>
                      setClienteEditando({
                        ...clienteEditando,
                        endereco: e.target.value
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />

                  <button
                    onClick={salvarEdicao}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Salvar
                  </button>

                </div>

              ) : (

                <div>

                  <h3 className="text-xl font-bold mb-2">
                    {c.nome_cliente}
                  </h3>

                  <p><strong>🐶 Pet:</strong> {c.nome_pet}</p>
                  <p><strong>📞 Telefone:</strong> {c.telefone}</p>
                  <p><strong>📍 Endereço:</strong> {c.endereco}</p>

                  <p className="mt-2">
                    <strong>💰 Total gasto:</strong> R$ {c.totalGasto || 0}
                  </p>

                  <div className="flex gap-3 mt-4 flex-wrap">

                    <button
                      onClick={() => setClienteEditando(c)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirCliente(c.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Excluir
                    </button>

                    <button
                      onClick={() => navigate(`/admin/historico/${c.id}`)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg"
                    >
                      Histórico
                    </button>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {/* MODAL RANKING */}

      {mostrarRanking && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">

            <div className="flex justify-between items-center mb-6">

              <h3 className="text-2xl font-bold">
                🏆 Ranking de Clientes
              </h3>

              <button
                onClick={() => setMostrarRanking(false)}
                className="text-gray-500 hover:text-black"
              >
                ✖
              </button>

            </div>

            <div className="space-y-3">

              {rankingClientes.map((c, index) => (

                <div
                  key={c.id}
                  className="flex justify-between bg-gray-100 p-3 rounded-xl"
                >

                  <div>

                    <p className="font-bold">

                      {index === 0 && "🥇 "}
                      {index === 1 && "🥈 "}
                      {index === 2 && "🥉 "}

                      {index + 1}º {c.nome_cliente}

                    </p>

                    <p className="text-sm text-gray-600">
                      Pet: {c.nome_pet}
                    </p>

                  </div>

                  <p className="font-bold text-green-600">
                    R$ {c.totalGasto}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>

  );
}