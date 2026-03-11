import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminDespesas(){

const navigate = useNavigate();

const [funcionarios,setFuncionarios] = useState([]);
const [despesas,setDespesas] = useState([]);

const [funcionario,setFuncionario] = useState("");
const [descricao,setDescricao] = useState("");
const [valor,setValor] = useState("");
const [data,setData] = useState("");
const [tipo,setTipo] = useState("despesa");

useEffect(()=>{
buscarFuncionarios();
buscarDespesas();
},[])

async function buscarFuncionarios(){

const { data } = await supabase
.from("profiles")
.select("id,nome,role")
.eq("role","membro");

setFuncionarios(data || []);

}

async function buscarDespesas(){

const { data } = await supabase
.from("despesas_funcionarios")
.select(`
id,
descricao,
valor,
data,
tipo,
funcionario_id,
profiles(nome)
`)
.order("data",{ascending:false});

setDespesas(data || []);

}

async function salvar(){

if(!funcionario || !descricao || !valor){

alert("Preencha todos os campos");
return;

}

await supabase
.from("despesas_funcionarios")
.insert({

funcionario_id: funcionario,
descricao,
valor,
data,
tipo

});

alert("Registro salvo");

setDescricao("");
setValor("");
setData("");

buscarDespesas();

}

function despesasPorFuncionario(id){

return despesas.filter(d=>d.funcionario_id===id);

}

return(

<div className="p-4 max-w-md mx-auto">

<button
onClick={()=>navigate(-1)}
className="mb-4 text-blue-600 text-sm"
>
← Voltar
</button>

<h2 className="text-xl font-bold mb-4">
Registrar Despesa / Vale
</h2>

<div className="flex flex-col gap-2 mb-6">

<select
value={funcionario}
onChange={e=>setFuncionario(e.target.value)}
className="p-2 border rounded text-sm"
>

<option value="">Funcionário</option>

{funcionarios.map(f=>(

<option key={f.id} value={f.id}>
{f.nome}
</option>

))}

</select>

<select
value={tipo}
onChange={e=>setTipo(e.target.value)}
className="p-2 border rounded text-sm"
>
<option value="despesa">Despesa (50%)</option>
<option value="vale">Vale (100%)</option>
</select>

<input
placeholder="Descrição"
value={descricao}
onChange={e=>setDescricao(e.target.value)}
className="p-2 border rounded text-sm"
/>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={e=>setValor(e.target.value)}
className="p-2 border rounded text-sm"
/>

<input
type="date"
value={data}
onChange={e=>setData(e.target.value)}
className="p-2 border rounded text-sm"
/>

<button
onClick={salvar}
className="bg-red-600 text-white py-2 rounded text-sm"
>
Salvar
</button>

</div>

<h2 className="text-lg font-bold mb-4">
Despesas e Vales
</h2>

<div className="flex flex-col gap-4">

{funcionarios.map(f=>{

const lista = despesasPorFuncionario(f.id);

if(lista.length===0) return null;

return(

<div key={f.id} className="border rounded p-3 bg-white shadow-sm">

<h3 className="font-semibold text-sm mb-2">
{f.nome}
</h3>

<div className="overflow-x-auto">

<table className="w-full text-xs">

<thead>

<tr className="border-b">

<th className="py-1 text-left">Data</th>
<th className="text-left">Motivo</th>
<th className="text-left">Tipo</th>
<th className="text-right">Valor</th>

</tr>

</thead>

<tbody>

{lista.map(d=>(

<tr key={d.id} className="border-b">

<td className="py-1">
{d.data}
</td>

<td>
{d.descricao}
</td>

<td>
{d.tipo}
</td>

<td className="text-right">
R$ {Number(d.valor).toFixed(2)}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

})}

</div>

</div>

)

}