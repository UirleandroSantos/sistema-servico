import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function ListaOrdens() {
  const [ordens, setOrdens] = useState([]);

  useEffect(() => {
    async function fetchOrdens() {
      const { data } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          clientes(nome_cliente, nome_pet),
          profiles(nome)
        `);

      setOrdens(data || []);
    }

    fetchOrdens();
  }, []);

  return (
    <div>
      <h2>Ordens Criadas</h2>

      {ordens.map((o) => (
        <div key={o.id}>
          <p><strong>Cliente:</strong> {o.clientes?.nome_cliente}</p>
          <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
          <p><strong>Funcionário:</strong> {o.profiles?.nome}</p>
          <p><strong>Serviço:</strong> {o.tipo_servico}</p>
          <p><strong>Valor:</strong> R$ {o.valor}</p>
        </div>
      ))}
    </div>
  );
}
