import { useEffect,useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminMovimentacoes(){

const navigate = useNavigate();

const [movimentos,setMovimentos] = useState([]);

useEffect(()=>{
buscarMovimentos();
},[]);

async function buscarMovimentos(){

const {data} = await supabase
.from("movimentacoes_financeiras")
.select("*")
.order("data",{ascending:false});

setMovimentos(data || []);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

return(

<div className="p-4 md:p-8 max-w-5xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-2xl md:text-3xl font-bold mb-6">
Movimentações Financeiras
</h2>

{/* DESKTOP - TABELA */}

<div className="hidden md:block bg-white rounded shadow overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">Tipo</th>
<th className="p-3 text-left">Categoria</th>
<th className="p-3 text-left">Descrição</th>
<th className="p-3 text-left">Valor</th>
<th className="p-3 text-left">Data</th>

</tr>

</thead>

<tbody>

{movimentos.map(m=>(

<tr key={m.id} className="border-t hover:bg-gray-50">

<td className="p-3">

{m.tipo === "entrada"
? <span className="text-green-600 font-semibold">Entrada</span>
: <span className="text-red-600 font-semibold">Saída</span>
}

</td>

<td className="p-3">
{m.categoria}
</td>

<td className="p-3">
{m.descricao}
</td>

<td className="p-3 font-semibold">
{formatar(m.valor)}
</td>

<td className="p-3">
{new Date(m.data).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

{/* MOBILE - CARDS */}

<div className="md:hidden space-y-4">

{movimentos.map(m=>(

<div
key={m.id}
className="bg-white p-4 rounded shadow"
>

<div className="flex justify-between items-center mb-2">

<span className={`font-semibold ${m.tipo === "entrada" ? "text-green-600":"text-red-600"}`}>
{m.tipo === "entrada" ? "Entrada":"Saída"}
</span>

<span className="text-sm text-gray-500">
{new Date(m.data).toLocaleDateString()}
</span>

</div>

<p className="text-sm text-gray-600 mb-2">
{m.categoria}
</p>

<p className="text-sm mb-3">
{m.descricao}
</p>

<p className="text-lg font-bold">
{formatar(m.valor)}
</p>

</div>

))}

</div>

</div>

);

}