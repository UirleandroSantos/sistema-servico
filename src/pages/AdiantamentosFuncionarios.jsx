import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdiantamentosFuncionarios(){

const navigate = useNavigate();

const [funcionarios,setFuncionarios] = useState([]);
const [adiantamentos,setAdiantamentos] = useState([]);

const [funcionario,setFuncionario] = useState("");
const [valor,setValor] = useState("");
const [motivo,setMotivo] = useState("");
const [data,setData] = useState("");

const [mostrarForm,setMostrarForm] = useState(false);

useEffect(()=>{

buscarFuncionarios();
buscarAdiantamentos();

},[])

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome");

setFuncionarios(data || []);

}

async function buscarAdiantamentos(){

const {data} = await supabase
.from("adiantamentos_funcionarios")
.select(`
id,
valor,
descricao,
data,
profiles(nome)
`)
.order("data",{ascending:false});

setAdiantamentos(data || []);

}

async function registrar(){

if(!funcionario || !valor) return;

await supabase
.from("adiantamentos_funcionarios")
.insert({

funcionario_id:funcionario,
valor:valor,
descricao:motivo,
data:data || new Date()

});

setValor("");
setMotivo("");
setFuncionario("");
setData("");

buscarAdiantamentos();

setMostrarForm(false);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
})

}

return(

<div className="p-8">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-3xl font-bold mb-8">

Histórico de Adiantamentos

</h2>

<button
onClick={()=>setMostrarForm(true)}
className="bg-green-600 text-white px-6 py-2 rounded mb-8"
>
Registrar Adiantamento
</button>

{mostrarForm && (

<div className="bg-white p-6 rounded shadow mb-10">

<h3 className="text-xl font-bold mb-4">

Novo Adiantamento

</h3>

<div className="grid md:grid-cols-4 gap-4">

<select
value={funcionario}
onChange={e=>setFuncionario(e.target.value)}
className="p-2 border rounded"
>

<option value="">Funcionário</option>

{funcionarios.map(f=>(

<option key={f.id} value={f.id}>
{f.nome}
</option>

))}

</select>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={e=>setValor(e.target.value)}
className="p-2 border rounded"
/>

<input
placeholder="Motivo"
value={motivo}
onChange={e=>setMotivo(e.target.value)}
className="p-2 border rounded"
/>

<input
type="date"
value={data}
onChange={e=>setData(e.target.value)}
className="p-2 border rounded"
/>

</div>

<button
onClick={registrar}
className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
>

Salvar

</button>

</div>

)}

<div className="bg-white p-6 rounded shadow">

<table className="w-full">

<thead>

<tr className="border-b">

<th className="text-left p-2">Funcionário</th>
<th className="text-left p-2">Valor</th>
<th className="text-left p-2">Motivo</th>
<th className="text-left p-2">Data</th>

</tr>

</thead>

<tbody>

{adiantamentos.map(a=>(

<tr key={a.id} className="border-b">

<td className="p-2">
{a.profiles?.nome}
</td>

<td className="p-2">
{formatar(a.valor)}
</td>

<td className="p-2">
{a.descricao}
</td>

<td className="p-2">
{new Date(a.data).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}