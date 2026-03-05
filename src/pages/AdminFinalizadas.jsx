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
  const [erroFiltro, setErroFiltro] = useState("");
  const [loading, setLoading] = useState(false);

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
    setErroFiltro("");
    setDados({});
    setLoading(true);

    if (!dataInicio || !dataFim) {
      setErroFiltro("Selecione a data inicial e a data final.");
      setLoading(false);
      return;
    }

    if (dataInicio > dataFim) {
      setErroFiltro("Data inicial maior que data final.");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (nome_cliente, nome_pet),
        profiles (id, nome, comissao)
      `)
      .eq("status", "finalizado")
      .gte("data_finalizacao", dataInicio)
      .lte("data_finalizacao", dataFim);

    if (funcionarioSelecionado) {
      query = query.eq("funcionario_id", funcionarioSelecionado);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      setErroFiltro("Erro ao buscar dados.");
      setLoading(false);
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

    setLoading(false);
  }

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
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

      {erroFiltro && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {erroFiltro}
        </div>
      )}

      {loading && <p>Carregando...</p>}

      {/* RESUMO */}
      {!loading && Object.keys(dados).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Resumo</h3>
          <p><strong>Total Bruto:</strong> {formatar(resumoFinanceiro.brutoTotal)}</p>

          {Object.entries(resumoFinanceiro.comissoes).map(([nome, valor]) => (
            <p key={nome}>
              <strong>{nome}:</strong> {formatar(valor)}
            </p>
          ))}
        </div>
      )}

      {/* LISTAGEM */}
      {!loading && Object.entries(dados).map(([nome, ordens]) => (
        <div key={nome} className="bg-white p-6 rounded-xl shadow-md mb-4">
          <h4
            className="font-bold cursor-pointer"
            onClick={() => setExpandido(expandido === nome ? null : nome)}
          >
            {nome} ({ordens.length} serviços)
          </h4>

          {expandido === nome && (
            <div className="mt-4 space-y-2">
              {ordens.map((o) => (
                <div key={o.id} className="border p-3 rounded-lg">
                  <p><strong>Cliente</strong>: {o.clientes?.nome_cliente}</p>
                  <p><strong>Pet</strong>: {o.clientes?.nome_pet}</p>
                  <p><strong>Serviço</strong>: {o.tipo_servico}</p>
                  <p><strong>Data de Finalização:</strong> {formatarData(o.data_finalizacao)}</p>
                  <p><strong>Valor</strong>: {formatar(o.valor)}</p>
                  <p><strong>Comissão</strong>: {formatar(o.comissaoCalculada)}</p>
                  <p><strong>Status: <span className="text-green-500 text-xl font-semibold mb-4">{o.status}</span></strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

    </div>
  );
}