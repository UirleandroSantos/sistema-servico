import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function NovaOrdem() {
  const navigate = useNavigate();

  function getHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [form, setForm] = useState({
    data_servico: getHoje(),
    funcionario_id: "",
    tipo_servico: "",
    valor: "",
    observacoes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("*");

      const { data: funcionariosData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "membro");

      setClientes(clientesData || []);
      setFuncionarios(funcionariosData || []);
    }

    fetchData();
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nome_cliente || ""} ${c.nome_pet || ""}`
      .toLowerCase()
      .includes(buscaCliente.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!clienteSelecionado) {
      alert("Selecione um cliente");
      return;
    }

    if (!form.funcionario_id) {
      alert("Selecione um funcionário");
      return;
    }

    if (!form.tipo_servico) {
      alert("Selecione o tipo de serviço");
      return;
    }

    if (!form.valor) {
      alert("Informe o valor");
      return;
    }

    // 🔥 Garante data atual no momento do clique
    const dataFinal = form.data_servico
      ? form.data_servico
      : getHoje();

    const { error } = await supabase
      .from("ordens_servico")
      .insert([
        {
          cliente_id: clienteSelecionado.id,
          funcionario_id: form.funcionario_id,
          tipo_servico: form.tipo_servico,
          data_servico: dataFinal,
          valor: Number(form.valor),
          observacoes: form.observacoes,
          status: "pendente",
        },
      ]);

    if (error) {
      console.log(error);
      alert("Erro ao criar ordem");
    } else {
      alert("Ordem criada com sucesso!");
      navigate(-1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Nova Ordem de Serviço
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 🔎 BUSCA CLIENTE */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar cliente ou pet..."
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setClienteSelecionado(null);
              }}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {buscaCliente && !clienteSelecionado && (
              <div className="absolute w-full bg-white border rounded-lg shadow-md max-h-40 overflow-y-auto mt-1 z-50">
                {clientesFiltrados.length === 0 && (
                  <div className="p-2 text-gray-500 text-sm">
                    Nenhum encontrado
                  </div>
                )}

                {clientesFiltrados.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setClienteSelecionado(c);
                      setBuscaCliente(`${c.nome_cliente} - ${c.nome_pet}`);
                    }}
                  >
                    {c.nome_cliente} - {c.nome_pet}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <select
              value={form.funcionario_id}
              onChange={(e) =>
                setForm({ ...form, funcionario_id: e.target.value })
              }
              required
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Selecione o Funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>

            <select
              value={form.tipo_servico}
              onChange={(e) =>
                setForm({ ...form, tipo_servico: e.target.value })
              }
              required
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Tipo de Serviço</option>
              <option>Banho</option>
              <option>Tosa Higiênica</option>
              <option>Tosa Completa</option>
              <option>Outro</option>
            </select>

            <input
              type="date"
              value={form.data_servico}
              onChange={(e) =>
                setForm({ ...form, data_servico: e.target.value })
              }
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="number"
              placeholder="Valor"
              value={form.valor}
              onChange={(e) =>
                setForm({ ...form, valor: e.target.value })
              }
              required
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

          <textarea
            placeholder="Observações"
            value={form.observacoes}
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Criar Ordem
          </button>

        </form>
      </div>
    </div>
  );
}