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
const hoje = new Date().toISOString().split("T")[0];
const [data,setData] = useState(hoje);
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

let valorFinal = Number(valor);

if(tipo === "despesa"){
valorFinal = valorFinal / 2;
}

await supabase
.from("despesas_funcionarios")
.insert({

funcionario_id: funcionario,
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

async function cancelarDespesa(id){

const confirmar = confirm("Cancelar esta despesa?");

if(!confirmar) return;

await supabase
.from("despesas_funcionarios")
.delete()
.eq("id",id);

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
className="bg-green-600 text-white py-2 rounded text-sm"
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

<h3 className="font-semibold text-sm mb-3">
{f.nome}
</h3>

<div className="flex flex-col gap-3">

{lista.map(d=>(

<div key={d.id} className="border rounded p-3 bg-gray-50">

<div className="flex justify-between text-xs mb-1">
<span>{d.data}</span>
<span className="font-semibold">
R$ {Number(d.valor).toFixed(2)}
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
className="w-full bg-red-500 text-white py-2 rounded text-sm active:scale-95"
>
Cancelar despesa
</button>

</div>

))}

</div>

</div>

)

})}

</div>

</div>

)

}