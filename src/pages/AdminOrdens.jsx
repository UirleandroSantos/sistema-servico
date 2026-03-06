import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminOrdens() {

  const navigate = useNavigate();

  const [modo, setModo] = useState("pendentes");
  const [dados, setDados] = useState({});
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [erroFiltro, setErroFiltro] = useState("");
  const [loading, setLoading] = useState(false);

  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    brutoTotal: 0,
    totalComissoes: 0,
    lucroLiquido: 0,
    comissoes: {}
  });

  useEffect(() => {
    buscarFuncionarios();
    buscarPendentes();
  }, []);

  useEffect(() => {
    if (modo === "pendentes") {
      buscarPendentes();
    }
  }, [modo]);

  async function buscarFuncionarios() {

    const { data } = await supabase
      .from("profiles")
      .select("id,nome")
      .eq("role", "membro");

    setFuncionarios(data || []);
  }

  function aplicarFiltroMes(mes) {

    if (!mes) return;

    const [ano, mesNumero] = mes.split("-");

    const primeiroDia = `${ano}-${mesNumero}-01`;

    const ultimoDia = new Date(ano, mesNumero, 0)
      .toISOString()
      .split("T")[0];

    setDataInicio(primeiroDia);
    setDataFim(ultimoDia);
  }

  async function buscarPendentes() {

    setLoading(true);

    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (nome_cliente,nome_pet),
        profiles (nome)
      `)
      .eq("status", "pendente");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const agrupado = {};

    data?.forEach((o) => {

      const nome = o.profiles?.nome || "Sem funcionário";

      if (!agrupado[nome]) {
        agrupado[nome] = [];
      }

      agrupado[nome].push(o);

    });

    setDados(agrupado);

    setLoading(false);
  }

  async function buscarFinalizados() {

    setErroFiltro("");
    setDados({});
    setLoading(true);

    if (!dataInicio || !dataFim) {
      setErroFiltro("Selecione a data inicial e final.");
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
        clientes (nome_cliente,nome_pet),
        profiles (id,nome,comissao)
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
      setLoading(false);
      return;
    }

    const agrupado = {};
    let brutoTotal = 0;
    let totalComissoes = 0;
    const comissoes = {};

    data?.forEach((o) => {

      const nome = o.profiles?.nome || "Sem funcionário";
      const porcentagem = o.profiles?.comissao || 0;
      const valor = Number(o.valor);

      const comissao = (valor * porcentagem) / 100;

      brutoTotal += valor;
      totalComissoes += comissao;

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
      totalComissoes,
      lucroLiquido: brutoTotal - totalComissoes,
      comissoes
    });

    setLoading(false);
  }

  async function cancelarOrdem(id) {

    const confirmar = window.confirm("Tem certeza que deseja cancelar esta ordem?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("ordens_servico")
      .update({
        status: "cancelado"
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao cancelar ordem");
      return;
    }

    buscarPendentes();
  }

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(data) {

    if (!data) return "-";

    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");

  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-6">

        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <button
          onClick={() =>
            setModo(modo === "pendentes" ? "finalizados" : "pendentes")
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {modo === "pendentes"
            ? "Ver serviços finalizados"
            : "Ver serviços pendentes"}
        </button>

      </div>

      <h2 className="text-3xl font-bold mb-6">

        {modo === "pendentes"
          ? "Serviços Pendentes"
          : "Relatório Financeiro"}

      </h2>

      <div className="mb-6">

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={buscaCliente}
          onChange={(e) => setBuscaCliente(e.target.value)}
          className="p-2 border rounded-lg w-full max-w-md"
        />

      </div>

      {loading && <p>Carregando...</p>}

      {!loading && Object.entries(dados).map(([nome, ordens]) => (

        <div key={nome} className="bg-white p-6 rounded-xl shadow-md mb-4">

          <h4
            className="font-bold cursor-pointer"
            onClick={() =>
              setExpandido(expandido === nome ? null : nome)
            }
          >
            {nome} ({ordens.length} serviços)
          </h4>

          {expandido === nome && (

            <div className="mt-4 space-y-2">

              {ordens
                .filter((o) =>
                  o.clientes?.nome_cliente
                    ?.toLowerCase()
                    .includes(buscaCliente.toLowerCase())
                )
                .map((o) => (

                  <div
                    key={o.id}
                    className="border p-3 rounded-lg"
                  >

                    <p>
                      <strong>Cliente:</strong> {o.clientes?.nome_cliente}
                    </p>

                    <p>
                      <strong>Pet:</strong> {o.clientes?.nome_pet}
                    </p>

                    <p>
                      <strong>Serviço:</strong> {o.tipo_servico}
                    </p>

                    <p>
                      <strong>Valor:</strong> {formatar(o.valor)}
                    </p>

                    <p>
                      <strong>Status:</strong>
                      <span className="text-green-600 font-semibold ml-2">
                        {o.status}
                      </span>
                    </p>

                    {modo === "pendentes" && (

                      <button
                        onClick={() => cancelarOrdem(o.id)}
                        className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        Cancelar Ordem
                      </button>

                    )}

                  </div>

                ))}

            </div>

          )}

        </div>

      ))}

    </div>

  );

}