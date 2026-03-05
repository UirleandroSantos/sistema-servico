import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AdminGraficoFinanceiro() {

  const navigate = useNavigate();

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

    const resultado = Object.keys(meses)
      .sort()
      .map((m)=>({

        mes:m,
        total:meses[m]

      }));

    setDados(resultado);

  }

  return(

    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg">

      <button
          onClick={() => navigate("/admin")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📊 Faturamento Mensal
      </h2>

      <ResponsiveContainer width="100%" height={350}>

        <BarChart data={dados}>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="mes"
            tick={{ fill:"#374151" }}
          />

          <YAxis
            tick={{ fill:"#374151" }}
          />

          <Tooltip
            contentStyle={{
              background:"#111827",
              border:"none",
              borderRadius:"10px",
              color:"#fff"
            }}
            formatter={(value)=>
              [`R$ ${value}`, "Faturamento"]
            }
          />

          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          <Bar
            dataKey="total"
            fill="url(#colorBar)"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );
}