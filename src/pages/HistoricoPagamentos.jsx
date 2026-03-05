import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function HistoricoPagamentos(){

const navigate = useNavigate();

const [pagamentos,setPagamentos] = useState([]);
const [funcionarios,setFuncionarios] = useState([]);

const [funcionario,setFuncionario] = useState("");
const [mes,setMes] = useState("");

useEffect(()=>{

buscarFuncionarios();
buscarPagamentos();

},[])

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome");

setFuncionarios(data || []);

}

async function buscarPagamentos(){

let query = supabase
.from("pagamentos_funcionarios")
.select(`
*,
profiles(nome)
`)
.order("data_pagamento",{ascending:false});

if(funcionario){
query = query.eq("funcionario_id",funcionario);
}

if(mes){

const [ano,mesNumero] = mes.split("-");

const inicio = `${ano}-${mesNumero}-01`;

const fim = new Date(ano,mesNumero,0)
.toISOString()
.split("T")[0];

query = query
.gte("data_inicio",inicio)
.lte("data_fim",fim);

}

const {data} = await query;

setPagamentos(data || []);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

return(

<div className="p-4 md:p-8 max-w-6xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-2xl md:text-3xl font-bold mb-6">
Histórico de Pagamentos
</h2>

{/* FILTROS */}

<div className="flex flex-col md:flex-row gap-3 mb-6">

<select
value={funcionario}
onChange={e=>setFuncionario(e.target.value)}
className="p-2 border rounded w-full"
>

<option value="">Funcionário</option>

{funcionarios.map(f=>(

<option key={f.id} value={f.id}>
{f.nome}
</option>

))}

</select>

<input
type="month"
value={mes}
onChange={e=>setMes(e.target.value)}
className="p-2 border rounded w-full"
/>

<button
onClick={buscarPagamentos}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full md:w-auto"
>
Buscar
</button>

</div>

{/* DESKTOP - TABELA */}

<div className="hidden md:block bg-white rounded shadow overflow-hidden">

<table className="w-full">

<thead className="bg-gray-100">

<tr>

<th className="text-left p-3">Funcionário</th>
<th className="text-left p-3">Período</th>
<th className="text-left p-3">Comissão</th>
<th className="text-left p-3">Adiantamentos</th>
<th className="text-left p-3">Total Pago</th>
<th className="text-left p-3">Data pagamento</th>

</tr>

</thead>

<tbody>

{pagamentos.map(p=>(

<tr key={p.id} className="border-t hover:bg-gray-50">

<td className="p-3">
{p.profiles?.nome}
</td>

<td className="p-3">
{new Date(p.data_inicio).toLocaleDateString()} - {new Date(p.data_fim).toLocaleDateString()}
</td>

<td className="p-3">
{formatar(p.total_comissao)}
</td>

<td className="p-3">
{formatar(p.total_adiantamentos)}
</td>

<td className="p-3 font-semibold text-green-600">
{formatar(p.total_pago)}
</td>

<td className="p-3">
{new Date(p.data_pagamento).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

{/* CELULAR - CARDS */}

<div className="md:hidden space-y-4">

{pagamentos.map(p=>(

<div
key={p.id}
className="bg-white p-4 rounded shadow"
>

<p className="font-bold text-lg mb-2">
{p.profiles?.nome}
</p>

<p className="text-sm text-gray-600 mb-2">
Período: {new Date(p.data_inicio).toLocaleDateString()} - {new Date(p.data_fim).toLocaleDateString()}
</p>

<div className="flex justify-between text-sm mb-1">
<span>Comissão</span>
<span>{formatar(p.total_comissao)}</span>
</div>

<div className="flex justify-between text-sm mb-1">
<span>Adiantamentos</span>
<span>{formatar(p.total_adiantamentos)}</span>
</div>

<div className="flex justify-between font-semibold text-green-600 mb-2">
<span>Total pago</span>
<span>{formatar(p.total_pago)}</span>
</div>

<p className="text-xs text-gray-500">
Pago em {new Date(p.data_pagamento).toLocaleDateString()}
</p>

</div>

))}

</div>

</div>

)

}