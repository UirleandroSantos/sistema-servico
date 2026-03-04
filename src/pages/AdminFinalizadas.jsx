import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminFinalizadas() {
  const navigate = useNavigate();

  const [dados, setDados] = useState({});
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    brutoTotal: 0,
    comissoes: {}
  });

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  async function buscarFuncionarios() {
    const { data } = await supabase
      .from("profiles")
      .select("id, nome")
      .eq("role", "membro");

    setFuncionarios(data || []);
  }

  async function buscarDados() {

    let query = supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (nome_cliente, nome_pet),
        profiles (id, nome, comissao)
      `)
      .eq("status", "finalizado");

    // ✅ CORREÇÃO DEFINITIVA DO FILTRO DE DATA
    if (dataInicio) {
      const inicio = `${dataInicio}T00:00:00`;
      query = query.gte("data_finalizacao", inicio);
    }

    if (dataFim) {
      const fim = `${dataFim}T23:59:59`;
      query = query.lte("data_finalizacao", fim);
    }

    if (funcionarioSelecionado) {
      query = query.eq("funcionario_id", funcionarioSelecionado);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      alert("Erro ao buscar dados");
      return;
    }

    const agrupado = {};
    let brutoTotal = 0;
    const comissoes = {};

    data?.forEach((o) => {
      const nome = o.profiles?.nome || "Sem funcionário";
      const porcentagem = o.profiles?.comissao || 0;
      const valor = Number(o.valor);
      const comissao = (valor * porcentagem) / 100;

      brutoTotal += valor;

      if (!agrupado[nome]) {
        agrupado[nome] = [];
        comissoes[nome] = 0;
      }

      comissoes[nome] += comissao;

      agrupado[nome].push({
        ...o,
        comissaoCalculada: comissao
      });
    });

    setDados(agrupado);
    setResumoFinanceiro({
      brutoTotal,
      comissoes
    });
  }

  function formatar(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
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
        Relatório Financeiro
      </h2>

      {/* FILTROS */}
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

        <div>
          <label className="text-sm text-gray-600">Funcionário</label>
          <select
            value={funcionarioSelecionado}
            onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            className="block p-2 border rounded-lg"
          >
            <option value="">Todos</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={buscarDados}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Consultar
        </button>
      </div>

      {/* RESUMO FINANCEIRO */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Resumo Financeiro</h3>

        <p>
          <strong>Valor Bruto Total (Admin): </strong>
          {formatar(resumoFinanceiro.brutoTotal)}
        </p>

        {Object.keys(resumoFinanceiro.comissoes).map((nome) => (
          <p key={nome}>
            <strong>Comissão {nome}: </strong>
            {formatar(resumoFinanceiro.comissoes[nome])}
          </p>
        ))}
      </div>

      {/* LISTAGEM POR FUNCIONÁRIO */}
      {Object.keys(dados).map((nome) => (
        <div key={nome} className="mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{nome}</h3>

            <button
              onClick={() =>
                setExpandido(expandido === nome ? null : nome)
              }
              className="text-blue-600 hover:underline text-sm"
            >
              {expandido === nome ? "Ocultar Serviços" : "Ver Serviços"}
            </button>
          </div>

          {expandido === nome && (
            <div className="mt-4 space-y-4">
              {dados[nome].map((o) => (
                <div
                  key={o.id}
                  className="bg-white p-4 rounded-xl shadow"
                >
                  <p><strong>Cliente:</strong> {o.clientes?.nome_cliente}</p>
                  <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
                  <p><strong>Serviço:</strong> {o.tipo_servico}</p>
                  <p><strong>Status:</strong> {o.status}</p>
                  <p><strong>Finalizado em:</strong> {formatarData(o.data_finalizacao)}</p>
                  <p><strong>Comissão:</strong> {formatar(o.comissaoCalculada)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

    </div>
  );
}