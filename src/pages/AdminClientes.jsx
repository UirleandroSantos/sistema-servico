import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminClientes() {

  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [clienteEditando, setClienteEditando] = useState(null);

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {

    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("nome_cliente");

    setClientes(data || []);
  }

  async function excluirCliente(id) {

    const confirmar = confirm("Deseja realmente excluir este cliente?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (!error) {
      buscarClientes();
    } else {
      alert("Erro ao excluir cliente");
    }
  }

  async function salvarEdicao() {

    const { error } = await supabase
      .from("clientes")
      .update(clienteEditando)
      .eq("id", clienteEditando.id);

    if (!error) {
      setClienteEditando(null);
      buscarClientes();
    } else {
      alert("Erro ao atualizar cliente");
    }
  }

  const filtrados = clientes.filter((c) =>
    `${c.nome_cliente} ${c.nome_pet}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <button
        onClick={() => navigate("/admin")}
        className="mb-6 text-blue-600"
      >
        ← Voltar
      </button>

      <h2 className="text-3xl font-bold mb-6">
        Clientes
      </h2>

      <input
        placeholder="Buscar cliente ou pet"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="border p-2 rounded mb-6 w-full"
      />

      {filtrados.map((c) => (

        <div
          key={c.id}
          className="bg-white p-4 rounded shadow mb-4"
        >

          {clienteEditando?.id === c.id ? (

            <div className="space-y-2">

              <input
                value={clienteEditando.nome_cliente}
                onChange={(e) =>
                  setClienteEditando({
                    ...clienteEditando,
                    nome_cliente: e.target.value
                  })
                }
                className="border p-2 w-full"
              />

              <input
                value={clienteEditando.nome_pet}
                onChange={(e) =>
                  setClienteEditando({
                    ...clienteEditando,
                    nome_pet: e.target.value
                  })
                }
                className="border p-2 w-full"
              />

              <input
                value={clienteEditando.endereco || ""}
                onChange={(e) =>
                    setClienteEditando({
                    ...clienteEditando,
                    endereco: e.target.value
                    })
                }
                placeholder="Endereço"
                className="border p-2 w-full"
                />

              <button
                onClick={salvarEdicao}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Salvar
              </button>

            </div>

          ) : (

            <div>

                <p><strong>Cliente:</strong> {c.nome_cliente}</p>
                <p><strong>Pet:</strong> {c.nome_pet}</p>
                <p><strong>Telefone:</strong> {c.telefone}</p>
                <p><strong>Endereço:</strong> {c.endereco}</p>

              <div className="flex gap-3 mt-2">

                <button
                  onClick={() => setClienteEditando(c)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => excluirCliente(c.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>

                <button
                  onClick={() => navigate(`/admin/historico/${c.id}`)}
                  className="bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Histórico
                </button>

              </div>

            </div>

          )}

        </div>

      ))}

    </div>
  );
}