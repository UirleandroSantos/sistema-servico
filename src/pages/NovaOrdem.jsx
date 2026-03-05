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

    // 🔥 Limpa o formulário para criar outra ordem
    setForm({
      data_servico: getHoje(),
      funcionario_id: "",
      tipo_servico: "",
      valor: "",
      observacoes: "",
    });

    // 🔥 limpa cliente
    setClienteSelecionado(null);
    setBuscaCliente("");

  }

}

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex justify-center items-start p-8">

      <div className="bg-white/90 backdrop-blur-lg w-full max-w-2xl p-8 rounded-3xl shadow-xl border">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
          🧾 Nova Ordem de Serviço
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* BUSCA CLIENTE */}

          <div className="relative">

            <label className="text-sm text-gray-500">
              Cliente / Pet
            </label>

            <input
              type="text"
              placeholder="🔎 Pesquisar cliente ou pet..."
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setClienteSelecionado(null);
              }}
              required
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
            />

            {buscaCliente && !clienteSelecionado && (

              <div className="absolute w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto mt-2 z-50">

                {clientesFiltrados.length === 0 && (

                  <div className="p-3 text-gray-500 text-sm">
                    Nenhum cliente encontrado
                  </div>

                )}

                {clientesFiltrados.map((c) => (

                  <div
                    key={c.id}
                    className="p-3 hover:bg-blue-50 cursor-pointer text-sm transition"
                    onClick={() => {
                      setClienteSelecionado(c);
                      setBuscaCliente(`${c.nome_cliente} - ${c.nome_pet}`);
                    }}
                  >
                    <strong>{c.nome_cliente}</strong> — {c.nome_pet}
                  </div>

                ))}

              </div>

            )}

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="text-sm text-gray-500">
                Funcionário
              </label>

              <select
                value={form.funcionario_id}
                onChange={(e) =>
                  setForm({ ...form, funcionario_id: e.target.value })
                }
                required
                className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              >

                <option value="">Selecione</option>

                {funcionarios.map((f) => (

                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="text-sm text-gray-500">
                Tipo de serviço
              </label>

              <select
                value={form.tipo_servico}
                onChange={(e) =>
                  setForm({ ...form, tipo_servico: e.target.value })
                }
                required
                className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              >

                <option value="">Selecione</option>
                <option>Banho</option>
                <option>Tosa Higiênica</option>
                <option>Tosa Completa</option>
                <option>Outro</option>

              </select>

            </div>

            <div>

              <label className="text-sm text-gray-500">
                Data
              </label>

              <input
                type="date"
                value={form.data_servico}
                onChange={(e) =>
                  setForm({ ...form, data_servico: e.target.value })
                }
                className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />

            </div>

            <div>

              <label className="text-sm text-gray-500">
                Valor (R$)
              </label>

              <input
                type="number"
                placeholder="Ex: 50"
                value={form.valor}
                onChange={(e) =>
                  setForm({ ...form, valor: e.target.value })
                }
                required
                className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="text-sm text-gray-500">
              Observações
            </label>

            <textarea
              placeholder="Observações do serviço..."
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
              className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-xl font-semibold text-lg hover:scale-[1.02] transition shadow-lg"
          >
            Criar Ordem de Serviço
          </button>

        </form>

      </div>

    </div>

  );

}