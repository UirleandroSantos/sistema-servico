import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function DashboardEquipe() {

  const [usuario, setUsuario] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [totalComissao, setTotalComissao] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);

  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [mesFiltro, setMesFiltro] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuario();
  }, [mostrarFinalizados, mesFiltro]);

  async function fetchUsuario() {

    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      navigate("/");
      return;
    }

    const userId = data.user.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setUsuario(profile);

    const status = mostrarFinalizados ? "finalizado" : "pendente";

    let query = supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (
          nome_cliente,
          nome_pet
        )
      `)
      .eq("funcionario_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (mostrarFinalizados && mesFiltro) {
      const [ano, mes] = mesFiltro.split("-");
      const inicio = `${ano}-${mes}-01`;
      const fim = `${ano}-${mes}-15`;
      query = query
        .gte("data_finalizacao", inicio)
        .lte("data_finalizacao", fim);
    }

    const { data: ordens } = await query;
    setOrdens(ordens || []);

    /* =========================
       CALCULO COMISSÕES E DESPESAS
    ========================= */

    const { data: ordensFinalizadas } = await supabase
      .from("ordens_servico")
      .select("valor,data_finalizacao")
      .eq("funcionario_id", userId)
      .eq("status", "finalizado");

    let total = 0;

    const porcentagem = profile?.comissao || 0;

    ordensFinalizadas?.forEach((o) => {
      const comissao = (Number(o.valor) * porcentagem) / 100;
      total += comissao;
    });

    // BUSCAR DESPESAS DO FUNCIONÁRIO
    let despesasTotal = 0;
    const { data: despesas } = await supabase
      .from("despesas_funcionarios")
      .select("valor")
      .eq("funcionario_id", userId);

    despesas?.forEach((d) => {
      despesasTotal += Number(d.valor);
    });

    // Total líquido = comissão - despesas
    setTotalComissao(total - despesasTotal);
    setTotalDespesas(despesasTotal);

  }

  async function finalizarOrdem(id) {
    const { error } = await supabase
      .from("ordens_servico")
      .update({
        status: "finalizado",
        data_finalizacao: new Date()
      })
      .eq("id", id);

    if (!error) {
      fetchUsuario();
    } else {
      alert("Erro ao finalizar serviço");
    }
  }

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          👋 Olá, {usuario?.nome} {usuario?.sobrenome}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>

      {/* COMISSÕES */}
      <div className="grid md:grid-cols-1 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm opacity-80">
            Comissão total (líquida de despesas)
          </p>
          <h3 className="text-3xl font-bold">
            {formatar(totalComissao)}
          </h3>
          {totalDespesas > 0 && (
            <p className="text-sm opacity-80 mt-2">
              (- {formatar(totalDespesas)} em despesas)
            </p>
          )}
        </div>
      </div>

      {/* BOTÕES */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMostrarFinalizados(false)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            !mostrarFinalizados ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setMostrarFinalizados(true)}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            mostrarFinalizados ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Finalizados
        </button>
      </div>

      {/* FILTRO MÊS */}
      {mostrarFinalizados && (
        <div className="mb-6">
          <input
            type="month"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      )}

      {/* TITULO */}
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        {mostrarFinalizados ? "Serviços Finalizados" : "Ordens Pendentes"}
      </h3>

      {/* LISTA */}
      {ordens.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-center">
          Nenhuma ordem encontrada.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ordens.map((o) => (
          <div
            key={o.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <p className="text-gray-700">
              <strong>Cliente:</strong> {o.clientes?.nome_cliente}
            </p>
            <p className="text-gray-700">
              <strong>Pet:</strong> {o.clientes?.nome_pet}
            </p>
            <p className="text-gray-700">
              <strong>Serviço:</strong> {o.tipo_servico}
            </p>
            <p className="text-gray-700">
              <strong>Valor:</strong> {formatar(Number(o.valor))}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong> {o.status}
            </p>

            {!mostrarFinalizados && (
              <button
                onClick={() => finalizarOrdem(o.id)}
                className="w-full mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                Finalizar Serviço
              </button>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}