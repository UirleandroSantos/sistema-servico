import { useEffect,useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminMovimentacoes(){

const navigate = useNavigate();

const hoje = new Date();
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
.toISOString().split("T")[0];

const hojeFormatado = hoje.toISOString().split("T")[0];

const [dataInicio,setDataInicio] = useState(primeiroDiaMes);
const [dataFim,setDataFim] = useState(hojeFormatado);

const [movimentos,setMovimentos] = useState([]);
const [entradaTotal,setEntradaTotal] = useState(0);
const [saidaTotal,setSaidaTotal] = useState(0);

const [filtroTipo,setFiltroTipo] = useState("todos");

useEffect(()=>{
buscarMovimentos();
},[]);

async function buscarMovimentos(){

const {data:mov} = await supabase
.from("movimentacoes_financeiras")
.select("*")
.gte("data",dataInicio)
.lte("data",dataFim);

const {data:despesas} = await supabase
.from("despesas_funcionarios")
.select(`
id,
descricao,
valor,
data,
tipo,
profiles(nome)
`)
.gte("data",dataInicio)
.lte("data",dataFim);

const despesasConvertidas = (despesas || []).map(d=>({

id:"despesa_"+d.id,
tipo:"saida",
categoria:d.tipo === "vale" ? "Vale Funcionário":"Despesa Funcionário",
descricao:`${d.descricao} - ${d.profiles?.nome || ""}`,
valor:d.valor,
data:d.data,
origem:"despesa",
funcionario:d.profiles?.nome

}));

const lista = [
...(mov || []),
...despesasConvertidas
];

lista.sort((a,b)=> new Date(b.data) - new Date(a.data));

setMovimentos(lista);

let entrada = 0;
let saida = 0;

lista.forEach(m=>{

if(m.tipo === "entrada"){
entrada += Number(m.valor);
}else{
saida += Number(m.valor);
}

});

setEntradaTotal(entrada);
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

function abrirDespesa(m){

if(m.origem === "despesa"){

alert(`Funcionário: ${m.funcionario}
Descrição: ${m.descricao}
Valor: ${formatar(m.valor)}`);

}

}

const listaFiltrada = movimentos.filter(m=>{

if(filtroTipo === "todos") return true;
if(filtroTipo === "entrada") return m.tipo === "entrada";
if(filtroTipo === "saida") return m.tipo === "saida";

});

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

{/* FILTROS */}

<div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-3 md:items-end">

<div className="flex flex-col">
<label className="text-sm text-gray-600">Data início</label>
<input
type="date"
value={dataInicio}
onChange={e=>setDataInicio(e.target.value)}
className="border p-2 rounded"
/>
</div>

<div className="flex flex-col">
<label className="text-sm text-gray-600">Data fim</label>
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

<div className="grid grid-cols-2 gap-4 mb-6">

<div
onClick={()=>setFiltroTipo("entrada")}
className="bg-green-50 border border-green-200 p-4 rounded cursor-pointer hover:bg-green-100"
>

<p className="text-sm text-gray-600">
Entrada
</p>

<p className="text-xl font-bold text-green-600">
{formatar(entradaTotal)}
</p>

</div>

<div
onClick={()=>setFiltroTipo("saida")}
className="bg-red-50 border border-red-200 p-4 rounded cursor-pointer hover:bg-red-100"
>

<p className="text-sm text-gray-600">
Saída
</p>

<p className="text-xl font-bold text-red-600">
{formatar(saidaTotal)}
</p>

</div>

</div>

{/* DESKTOP */}

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

{listaFiltrada.map(m=>(

<tr
key={m.id}
onClick={()=>abrirDespesa(m)}
className="border-t hover:bg-gray-50 cursor-pointer"
>

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
{m.data.split("-").reverse().join("/")}
</td>

</tr>

))}

</tbody>

</table>

</div>

{/* MOBILE */}

<div className="md:hidden space-y-4">

{listaFiltrada.map(m=>(

<div
key={m.id}
onClick={()=>abrirDespesa(m)}
className="bg-white p-4 rounded shadow cursor-pointer"
>

<div className="flex justify-between items-center mb-2">

<span className={`font-semibold ${m.tipo === "entrada" ? "text-green-600":"text-red-600"}`}>
{m.tipo === "entrada" ? "Entrada":"Saída"}
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