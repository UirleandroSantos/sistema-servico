import { useEffect,useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminMovimentacoes(){

const navigate = useNavigate();

const hoje = new Date();

const primeiroDiaMes = new Date(
hoje.getFullYear(),
hoje.getMonth(),
1
).toISOString().split("T")[0];

const hojeFormatado = hoje.toISOString().split("T")[0];

const [dataInicio,setDataInicio] = useState(primeiroDiaMes);
const [dataFim,setDataFim] = useState(hojeFormatado);

const [movimentos,setMovimentos] = useState([]);
const [saidaTotal,setSaidaTotal] = useState(0);

useEffect(()=>{
buscarMovimentos();
},[]);

async function buscarMovimentos(){

const {data} = await supabase
.from("movimentacoes_financeiras")
.select("*")
.eq("tipo","saida")
.gte("data",dataInicio)
.lte("data",dataFim)
.order("data",{ascending:false});

const lista = data || [];

setMovimentos(lista);

let saida = 0;

lista.forEach(m=>{
saida += Number(m.valor);
});

setSaidaTotal(saida);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

function filtrarHoje(){

const hoje = new Date().toISOString().split("T")[0];

setDataInicio(hoje);
setDataFim(hoje);

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
PagamentosFuncionários
</h2>

{/* FILTROS */}

<div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-3 md:items-end">

<div className="flex flex-col">
<label className="text-sm text-gray-600">
Data início
</label>

<input
type="date"
value={dataInicio}
onChange={e=>setDataInicio(e.target.value)}
className="border p-2 rounded"
/>
</div>

<div className="flex flex-col">
<label className="text-sm text-gray-600">
Data fim
</label>

<input
type="date"
value={dataFim}
onChange={e=>setDataFim(e.target.value)}
className="border p-2 rounded"
/>
</div>

<button
onClick={filtrarHoje}
className="bg-gray-500 text-white px-4 py-2 rounded text-sm"
>
Hoje
</button>

<button
onClick={buscarMovimentos}
className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
>
Buscar
</button>

</div>

{/* RESUMO */}

<div className="mb-6">

<div className="bg-red-50 border border-red-200 p-4 rounded">

<p className="text-sm text-gray-600">
Total pago a funcionários
</p>

<p className="text-2xl font-bold text-red-600">
{formatar(saidaTotal)}
</p>

</div>

</div>

{/* DESKTOP */}

<div className="hidden md:block bg-white rounded shadow overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="p-3 text-left">
Categoria
</th>

<th className="p-3 text-left">
Descrição
</th>

<th className="p-3 text-left">
Valor
</th>

<th className="p-3 text-left">
Data
</th>

</tr>

</thead>

<tbody>

{movimentos.map(m=>(

<tr
key={m.id}
className="border-t hover:bg-gray-50"
>

<td className="p-3">
{m.categoria}
</td>

<td className="p-3">
{m.descricao}
</td>

<td className="p-3 font-semibold text-red-600">
{formatar(m.valor)}
</td>

<td className="p-3">
{m.data.split("-").reverse().join("/")}
</td>

</tr>

))}

</tbody>

</table>

</div>

{/* MOBILE */}

<div className="md:hidden space-y-4">

{movimentos.map(m=>(

<div
key={m.id}
className="bg-white p-4 rounded shadow"
>

<div className="flex justify-between items-center mb-2">

<span className="font-semibold text-red-600">
Saída
</span>

<span className="text-sm text-gray-500">
{m.data.split("-").reverse().join("/")}
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