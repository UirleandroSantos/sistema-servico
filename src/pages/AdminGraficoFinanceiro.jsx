import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function AdminGraficoFinanceiro() {

  const [dados, setDados] = useState([]);

  useEffect(() => {
    buscar();
  }, []);

  async function buscar() {

    const { data } = await supabase
      .from("ordens_servico")
      .select("valor,data_finalizacao")
      .eq("status","finalizado");

    const meses = {};

    data?.forEach((o)=>{

      const mes = o.data_finalizacao?.slice(0,7);

      if(!meses[mes]) meses[mes]=0;

      meses[mes]+=Number(o.valor);

    });

    const resultado = Object.keys(meses).map((m)=>({

      mes:m,
      total:meses[m]

    }));

    setDados(resultado);

  }

  return(

    <div className="p-6 bg-white rounded shadow">

      <h2 className="text-2xl font-bold mb-6">
        Faturamento Mensal
      </h2>

      <BarChart width={600} height={300} data={dados}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="mes" />

        <YAxis />

        <Tooltip />

        <Bar dataKey="total" />

      </BarChart>

    </div>

  );
}