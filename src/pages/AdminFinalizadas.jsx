import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminFinalizadas() {
  const [resumo, setResumo] = useState({});
  const [aberto, setAberto] = useState(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    let query = supabase
      .from("ordens_servico")
      .select(`
        id,
        valor,
        data_servico,
        profiles(id, nome, comissao)
      `)
      .eq("status", "finalizado");

    if (dataInicio) query = query.gte("data_servico", dataInicio);
    if (dataFim) query = query.lte("data_servico", dataFim);

    const { data } = await query;

    const agrupado = {};

    data?.forEach((o) => {
      if (!o.profiles) return;

      const id = o.profiles.id;
      const nome = o.profiles.nome;
      const porcentagem = o.profiles.comissao || 0;
      const valor = Number(o.valor);
      const comissao = (valor * porcentagem) / 100;

      if (!agrupado[id]) {
        agrupado[id] = {
          nome,
          bruto: 0,
          comissao: 0,
          servicos: [],
        };
      }

      agrupado[id].bruto += valor;
      agrupado[id].comissao += comissao;
      agrupado[id].servicos.push(o);
    });

    setResumo(agrupado);
  }

  function formatar(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <button
        onClick={() => navigate("/admin")}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Voltar
      </button>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Resumo dos Funcionários
      </h2>

      {/* 🔎 FILTRO */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm text-gray-600">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="block p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="block p-2 border rounded-lg"
          />
        </div>

        <button
          onClick={fetchDados}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Filtrar
        </button>
      </div>

      {Object.keys(resumo).length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-gray-500">
          Nenhum serviço encontrado.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {Object.keys(resumo).map((id) => (
          <div
            key={id}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">
              {resumo[id].nome}
            </h3>

            <div className="space-y-2 mb-4">
              <p>
                <span className="font-semibold text-gray-600">Bruto:</span>{" "}
                {formatar(resumo[id].bruto)}
              </p>

              <p>
                <span className="font-semibold text-gray-600">Comissão:</span>{" "}
                <span className="text-green-600 font-bold">
                  {formatar(resumo[id].comissao)}
                </span>
              </p>
            </div>

            <button
              onClick={() =>
                setAberto(aberto === id ? null : id)
              }
              className="text-sm text-blue-600 hover:underline"
            >
              {aberto === id ? "Ocultar Serviços" : "Ver Serviços"}
            </button>

            {aberto === id && (
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                {resumo[id].servicos.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between bg-gray-50 p-2 rounded"
                  >
                    <span>{s.data_servico}</span>
                    <span className="font-semibold">
                      {formatar(Number(s.valor))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}