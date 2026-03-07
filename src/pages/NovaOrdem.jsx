import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function NovaOrdem() {

const navigate = useNavigate();

function getHoje(){
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth()+1).padStart(2,"0");
const dia = String(hoje.getDate()).padStart(2,"0");
return `${ano}-${mes}-${dia}`;
}

const [clientes,setClientes] = useState([]);
const [funcionarios,setFuncionarios] = useState([]);

const [buscaCliente,setBuscaCliente] = useState("");
const [clienteSelecionado,setClienteSelecionado] = useState(null);

const [ordensFila,setOrdensFila] = useState([]);

const [form,setForm] = useState({
data_servico:getHoje(),
funcionario_id:"",
tipo_servico:"",
valor:"",
observacoes:""
});

useEffect(()=>{

async function fetchData(){

const {data:clientesData} = await supabase
.from("clientes")
.select("*");

const {data:funcionariosData} = await supabase
.from("profiles")
.select("*")
.eq("role","membro");

setClientes(clientesData || []);
setFuncionarios(funcionariosData || []);

}

fetchData();

},[]);

const clientesFiltrados = clientes.filter(c=>
`${c.nome_cliente || ""} ${c.nome_pet || ""}`
.toLowerCase()
.includes(buscaCliente.toLowerCase())
);

/* =========================
SALVAR ORDEM NA FILA
========================= */

function salvarOrdem(e){

e.preventDefault();

if(!clienteSelecionado){
alert("Selecione um cliente");
return;
}

if(!form.funcionario_id){
alert("Selecione um funcionário");
return;
}

if(!form.tipo_servico){
alert("Selecione o serviço");
return;
}

if(!form.valor){
alert("Informe o valor");
return;
}

const novaOrdem = {

cliente_id:clienteSelecionado.id,
funcionario_id:form.funcionario_id,
tipo_servico:form.tipo_servico,
data_servico:form.data_servico || getHoje(),
valor:Number(form.valor),
observacoes:form.observacoes,
status:"pendente",

cliente:clienteSelecionado

};

setOrdensFila([...ordensFila,novaOrdem]);

setForm({
...form,
tipo_servico:"",
valor:"",
observacoes:""
});

setClienteSelecionado(null);
setBuscaCliente("");

}

/* =========================
ENVIAR TODAS ORDENS
========================= */

async function enviarOrdens(){

if(ordensFila.length === 0){
alert("Nenhuma ordem salva");
return;
}

/* remove campo cliente que é apenas visual */

const ordensParaSalvar = ordensFila.map(o => ({
cliente_id: o.cliente_id,
funcionario_id: o.funcionario_id,
tipo_servico: o.tipo_servico,
data_servico: o.data_servico,
valor: o.valor,
observacoes: o.observacoes,
status: o.status
}));

const {error} = await supabase
.from("ordens_servico")
.insert(ordensParaSalvar);

if(error){

console.log(error);
alert("Erro ao enviar ordens");

return;

}

alert("Ordens enviadas com sucesso!");

setOrdensFila([]);

setForm({
data_servico:getHoje(),
funcionario_id:"",
tipo_servico:"",
valor:"",
observacoes:""
});

}

return(

<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex justify-center items-start p-8">

<div className="bg-white/90 backdrop-blur-lg w-full max-w-3xl p-8 rounded-3xl shadow-xl border">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-3xl font-bold mb-8 text-gray-800">
🧾 Nova Ordem de Serviço
</h2>

<form onSubmit={salvarOrdem} className="space-y-5">

{/* FUNCIONÁRIO */}

<div>

<label className="text-sm text-gray-500">
Funcionário
</label>

<select
value={form.funcionario_id}
onChange={e=>setForm({...form,funcionario_id:e.target.value})}
required
className="mt-1 w-full p-3 border rounded-xl"
>

<option value="">Selecione</option>

{funcionarios.map(f=>(

<option key={f.id} value={f.id}>
{f.nome}
</option>

))}

</select>

</div>

{/* BUSCA CLIENTE */}

<div className="relative">

<label className="text-sm text-gray-500">
Cliente / Pet
</label>

<input
type="text"
placeholder="🔎 Pesquisar cliente ou pet..."
value={buscaCliente}
onChange={(e)=>{
setBuscaCliente(e.target.value);
setClienteSelecionado(null);
}}
className="w-full mt-1 p-3 border rounded-xl"
/>

{buscaCliente && !clienteSelecionado && (

<div className="absolute w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto mt-2 z-50">

{clientesFiltrados.length===0 && (

<div className="p-3 text-gray-500 text-sm">
Nenhum cliente encontrado
</div>

)}

{clientesFiltrados.map(c=>(

<div
key={c.id}
className="p-3 hover:bg-blue-50 cursor-pointer"
onClick={()=>{
setClienteSelecionado(c);
setBuscaCliente(`${c.nome_cliente} - ${c.nome_pet}`);
}}
>
<strong>{c.nome_cliente}</strong> — {c.nome_pet}
</div>

))}

</div>

)}

</div>

{/* DADOS SERVIÇO */}

<div className="grid md:grid-cols-2 gap-4">

<div>

<label className="text-sm text-gray-500">
Tipo de serviço
</label>

<select
value={form.tipo_servico}
onChange={e=>setForm({...form,tipo_servico:e.target.value})}
className="mt-1 w-full p-3 border rounded-xl"
>

<option value="">Selecione</option>
<option>Banho</option>
<option>Tosa Higiênica</option>
<option>Tosa Completa</option>
<option>Outro</option>

</select>

</div>

<div>

<label className="text-sm text-gray-500">
Data
</label>

<input
type="date"
value={form.data_servico}
onChange={e=>setForm({...form,data_servico:e.target.value})}
className="mt-1 w-full p-3 border rounded-xl"
/>

</div>

<div>

<label className="text-sm text-gray-500">
Valor
</label>

<input
type="number"
value={form.valor}
onChange={e=>setForm({...form,valor:e.target.value})}
className="mt-1 w-full p-3 border rounded-xl"
/>

</div>

<div>

<label className="text-sm text-gray-500">
Observações
</label>

<input
value={form.observacoes}
onChange={e=>setForm({...form,observacoes:e.target.value})}
className="mt-1 w-full p-3 border rounded-xl"
/>

</div>

</div>

<button
type="submit"
className="w-full bg-blue-600 text-white p-3 rounded-xl"
>
Salvar Ordem
</button>

</form>

{/* FILA */}

{ordensFila.length>0 && (

<div className="mt-10">

<h3 className="text-xl font-bold mb-4">
Ordens na fila ({ordensFila.length})
</h3>

<div className="space-y-2">

{ordensFila.map((o,i)=>(

<div key={i} className="border p-3 rounded-lg">

<p><strong>Cliente:</strong> {o.cliente.nome_cliente}</p>
<p><strong>Pet:</strong> {o.cliente.nome_pet}</p>
<p><strong>Serviço:</strong> {o.tipo_servico}</p>
<p><strong>Valor:</strong> R$ {o.valor}</p>

</div>

))}

</div>

<button
onClick={enviarOrdens}
className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
>
📤 Enviar Ordens
</button>

</div>

)}

</div>

</div>

);

}