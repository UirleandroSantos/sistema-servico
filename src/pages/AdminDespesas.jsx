import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminDespesas(){

const navigate = useNavigate();

/* =========================
ESTADOS
========================= */

const [funcionarios,setFuncionarios] = useState([]);
const [funcionarioSelecionado,setFuncionarioSelecionado] = useState(null);

const [despesas,setDespesas] = useState([]);

const [descricao,setDescricao] = useState("");
const [valor,setValor] = useState("");
const hoje = new Date().toISOString().split("T")[0];
const [data,setData] = useState(hoje);
const [tipo,setTipo] = useState("despesa");

/* =========================
BUSCAR FUNCIONÁRIOS
========================= */

useEffect(()=>{
buscarFuncionarios();
},[]);

async function buscarFuncionarios(){

const { data } = await supabase
.from("profiles")
.select("id,nome,role")
.eq("role","membro");

setFuncionarios(data || []);

}

/* =========================
🔥 BUSCAR DESPESAS (CORRIGIDO)
========================= */

useEffect(()=>{
if(funcionarioSelecionado){
buscarDespesas();
}
},[funcionarioSelecionado]);

async function buscarDespesas(){

if(!funcionarioSelecionado) return;

const { data } = await supabase
.from("despesas_funcionarios")
.select("*")
.eq("funcionario_id",funcionarioSelecionado.id)
.order("data",{ascending:false});

setDespesas(data || []);

}

/* =========================
SALVAR
========================= */

async function salvar(){

if(!descricao || !valor){

alert("Preencha todos os campos");
return;

}

let valorFinal = Number(valor);

if(tipo === "despesa"){
valorFinal = valorFinal / 2;
}

await supabase
.from("despesas_funcionarios")
.insert({

funcionario_id: funcionarioSelecionado.id,
descricao,
valor: valorFinal,
data,
tipo

});

alert("Registro salvo");

setDescricao("");
setValor("");
setData(hoje);

buscarDespesas();

}

/* =========================
CANCELAR
========================= */

async function cancelarDespesa(id){

const confirmar = confirm("Cancelar esta despesa?");
if(!confirmar) return;

await supabase
.from("despesas_funcionarios")
.delete()
.eq("id",id);

buscarDespesas();

}

function formatar(valor){
return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});
}

/* =========================
TELA DE FUNCIONÁRIOS
========================= */

if(!funcionarioSelecionado){

return(

<div className="p-6 max-w-md mx-auto">

<button
onClick={()=>navigate("/admin")}
className="text-blue-600 mb-4"
>
← Voltar
</button>

<h2 className="text-xl font-bold mb-6">
Funcionários
</h2>

<div className="flex flex-col gap-3">

{funcionarios.map(f=>(

<div
key={f.id}
onClick={()=>setFuncionarioSelecionado(f)}
className="p-3 border rounded bg-white shadow cursor-pointer hover:bg-gray-100"
>
{f.nome}
</div>

))}

</div>

</div>

)

}

/* =========================
TELA PRINCIPAL
========================= */

return(

<div className="p-6 max-w-md mx-auto">

<button
onClick={()=>{
setFuncionarioSelecionado(null);
setDespesas([]);
}}
className="text-blue-600 mb-4"
>
← Voltar
</button>

<h2 className="text-xl font-bold mb-4">
{funcionarioSelecionado.nome}
</h2>

{/* FORM */}

<div className="flex flex-col gap-2 mb-6">

<select
value={tipo}
onChange={e=>setTipo(e.target.value)}
className="p-2 border rounded"
>
<option value="despesa">Despesa (50%)</option>
<option value="vale">Vale (100%)</option>
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
className="bg-green-600 text-white py-2 rounded"
>
Salvar
</button>

</div>

{/* LISTA */}

<h2 className="text-lg font-bold mb-4">
Despesas e Vales
</h2>

<div className="flex flex-col gap-3">

{despesas.map(d=>(

<div key={d.id} className="border rounded p-3 bg-white shadow">

<div className="flex justify-between text-sm mb-1">
<span>{d.data}</span>
<span className="font-semibold">
{formatar(d.valor)}
</span>
</div>

<p className="text-sm mb-1">
{d.descricao}
</p>

<p className="text-xs text-gray-600 mb-2">
Tipo: {d.tipo}
</p>

<button
onClick={()=>cancelarDespesa(d.id)}
className="w-full bg-red-500 text-white py-2 rounded"
>
Cancelar despesa
</button>

</div>

))}

{despesas.length === 0 && (
<p className="text-sm text-gray-500">
Nenhuma despesa registrada
</p>
)}

</div>

</div>

)

}