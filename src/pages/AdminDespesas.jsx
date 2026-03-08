import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminDespesas(){

const navigate = useNavigate();

const [funcionarios,setFuncionarios] = useState([]);
const [funcionario,setFuncionario] = useState("");
const [descricao,setDescricao] = useState("");
const [valor,setValor] = useState("");
const [data,setData] = useState("");

useEffect(()=>{
buscarFuncionarios();
},[])

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome");

setFuncionarios(data || []);

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
data

});

alert("Despesa registrada");

setDescricao("");
setValor("");

}

return(

<div className="p-8 max-w-xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-3xl font-bold mb-6">
Registrar Despesa
</h2>

<div className="flex flex-col gap-4">

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
placeholder="Descrição"
value={descricao}
onChange={e=>setDescricao(e.target.value)}
className="p-2 border rounded"
/>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={e=>setValor(e.target.value)}
className="p-2 border rounded"
/>

<input
type="date"
value={data}
onChange={e=>setData(e.target.value)}
className="p-2 border rounded"
/>

<button
onClick={salvar}
className="bg-red-600 text-white py-2 rounded"
>
Salvar Despesa
</button>

</div>

</div>

)

}