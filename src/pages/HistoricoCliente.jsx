import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function HistoricoCliente() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState([]);

  useEffect(() => {
    buscar();
  }, []);

  async function buscar() {

    const { data } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        profiles(nome),
        clientes(nome_cliente,nome_pet)
      `)
      .eq("cliente_id", id)
      .order("data_servico", { ascending: false });

    setOrdens(data || []);
  }

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600"
      >
        ← Voltar
      </button>

      <h2 className="text-2xl font-bold mb-6">
        Histórico do Cliente
      </h2>

      {ordens.map((o) => (

        <div
          key={o.id}
          className="bg-white p-4 rounded shadow mb-4"
        >

          <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
          <p><strong>Serviço:</strong> {o.tipo_servico}</p>
          <p><strong>Funcionário:</strong> {o.profiles?.nome}</p>
          <p><strong>Valor:</strong> {formatar(o.valor)}</p>
          <p><strong>Status:</strong> {o.status}</p>

        </div>

      ))}

    </div>
  );
}