// import { useEffect, useState } from "react";
// import { supabase } from "../services/supabase";

// export default function DashboardFinanceiroAdmin() {
//   const [dados, setDados] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       const { data, error } = await supabase
//         .from("ordens_servico")
//         .select(`
//           valor,
//           status,
//           funcionario_id,
//           profiles(nome)
//         `)
//         .eq("status", "finalizado");

//       if (error) {
//         console.log(error);
//         return;
//       }

//       console.log("ORDENS FINALIZADAS:", data);

//       const agrupado = {};

//       data.forEach((item) => {
//         const nome = item.profiles?.nome;

//         if (!agrupado[nome]) {
//           agrupado[nome] = 0;
//         }

//         agrupado[nome] += Number(item.valor);
//       });

//       const resultado = Object.keys(agrupado).map((nome) => ({
//         nome,
//         total: agrupado[nome],
//       }));

//       setDados(resultado);
//     }

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h2>Resumo por Funcionário</h2>

//       {dados.length === 0 && <p>Nenhum serviço finalizado ainda.</p>}

//       {dados.map((d, index) => (
//         <div key={index}>
//           <p><strong>{d.nome}</strong></p>
//           <p>Total: R$ {d.total}</p>
//         </div>
//       ))}
//     </div>
//   );
// }