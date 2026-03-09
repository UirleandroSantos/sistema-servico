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

<div className="p-8 max-w-5xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-3xl font-bold mb-8">
Movimentações Financeiras
</h2>

<div className="bg-white rounded shadow overflow-hidden">

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

<tr key={m.id} className="border-t">

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

</div>

);

}