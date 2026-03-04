import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function DashboardEquipe() {
  const [usuario, setUsuario] = useState(null);
  const [ordensPendentes, setOrdensPendentes] = useState([]);
  const [totalComissao, setTotalComissao] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuario();
  }, []);

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

    const { data: pendentes } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes (nome_cliente, nome_pet)
      `)
      .eq("funcionario_id", userId)
      .eq("status", "pendente");

    setOrdensPendentes(pendentes || []);

    const { data: ordensFinalizadas } = await supabase
      .from("ordens_servico")
      .select("valor")
      .eq("funcionario_id", userId)
      .eq("status", "finalizado");

    let total = 0;
    const porcentagem = profile?.comissao || 0;

    ordensFinalizadas?.forEach((o) => {
      total += (Number(o.valor) * porcentagem) / 100;
    });

    setTotalComissao(total);
  }

  async function finalizarOrdem(id) {
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      status: "finalizado"
    })
    .eq("id", id);

  if (!error) {
    fetchUsuario();
  } else {
    alert("Erro ao finalizar serviço");
  }
}

  function formatar(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Olá, {usuario?.nome}
        </h2>

        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h3 className="text-lg text-gray-600 mb-2">
          Comissão Acumulada
        </h3>
        <p className="text-2xl font-bold text-green-600">
          {formatar(totalComissao)}
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-4">
        Ordens Pendentes
      </h3>

      {ordensPendentes.length === 0 && (
        <div className="bg-white p-4 rounded-xl shadow text-gray-500">
          Nenhuma ordem pendente.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {ordensPendentes.map((o) => (
          <div
            key={o.id}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <p><strong>Cliente:</strong> {o.clientes?.nome_cliente}</p>
            <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
            <p><strong>Serviço:</strong> {o.tipo_servico}</p>
            <p><strong>Valor:</strong> {formatar(Number(o.valor))}</p>
            <p><strong>Status:</strong> {o.status}</p>

            <button
              onClick={() => finalizarOrdem(o.id)}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition mt-4"
            >
              Finalizar Serviço
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}