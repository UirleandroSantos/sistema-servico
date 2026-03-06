import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminOrdens() {

const navigate = useNavigate();

const [modo,setModo] = useState("pendentes");
const [dados,setDados] = useState({});
const [funcionarios,setFuncionarios] = useState([]);
const [funcionarioSelecionado,setFuncionarioSelecionado] = useState("");
const [buscaCliente,setBuscaCliente] = useState("");

const [mesSelecionado,setMesSelecionado] = useState("");
const [dataInicio,setDataInicio] = useState("");
const [dataFim,setDataFim] = useState("");

const [expandido,setExpandido] = useState(null);
const [loading,setLoading] = useState(false);

const [resumoFinanceiro,setResumoFinanceiro] = useState({
brutoTotal:0,
totalComissoes:0,
lucroLiquido:0
});

useEffect(()=>{
buscarFuncionarios();
buscarPendentes();
},[]);

/* =========================
BUSCAR FUNCIONÁRIOS
========================= */

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome")
.eq("role","membro");

setFuncionarios(data || []);

}

/* =========================
FILTRO POR MÊS
========================= */

function aplicarFiltroMes(valor){

setMesSelecionado(valor);

if(!valor){
setDataInicio("");
setDataFim("");
return;
}

const [ano,mesNumero] = valor.split("-");

const inicio = `${ano}-${mesNumero}-01`;

const fim = new Date(ano,mesNumero,0)
.toISOString()
.split("T")[0];

setDataInicio(inicio);
setDataFim(fim);

}

/* =========================
BOTÃO BUSCAR
========================= */

function buscar(){

if(modo==="pendentes"){
buscarPendentes();
}

if(modo==="finalizados"){
buscarFinalizados();
}

}

/* =========================
BUSCAR PENDENTES
========================= */

async function buscarPendentes(){

setDados({});
setLoading(true);

const {data} = await supabase
.from("ordens_servico")
.select(`
*,
clientes(nome_cliente,nome_pet),
profiles(nome)
`)
.eq("status","pendente");

const agrupado = {};

data?.forEach(o=>{

const nome = o.profiles?.nome || "Sem funcionário";

if(!agrupado[nome]) agrupado[nome] = [];

agrupado[nome].push(o);

});

setDados(agrupado);
setLoading(false);

}

/* =========================
BUSCAR FINALIZADOS
========================= */

async function buscarFinalizados(){

setDados({});

if(!dataInicio || !dataFim){

alert("Selecione uma data inicial e final");
return;

}

setLoading(true);

let query = supabase
.from("ordens_servico")
.select(`
*,
clientes(nome_cliente,nome_pet),
profiles(id,nome,comissao)
`)
.eq("status","finalizado")
.gte("data_finalizacao",dataInicio)
.lte("data_finalizacao",dataFim);

if(funcionarioSelecionado){
query = query.eq("funcionario_id",funcionarioSelecionado);
}

const {data,error} = await query;

if(error){
console.log(error);
setLoading(false);
return;
}

let dadosFiltrados = data || [];

/* FILTRO CLIENTE AQUI */

if(buscaCliente){

dadosFiltrados = dadosFiltrados.filter(o =>
o.clientes?.nome_cliente
?.toLowerCase()
.includes(buscaCliente.toLowerCase())
);

}

const agrupado = {};

let brutoTotal = 0;
let totalComissoes = 0;

dadosFiltrados.forEach(o=>{

const nome = o.profiles?.nome || "Sem funcionário";
const porcentagem = o.profiles?.comissao || 0;

const valor = Number(o.valor);
const comissao = (valor * porcentagem)/100;

brutoTotal += valor;
totalComissoes += comissao;

if(!agrupado[nome]) agrupado[nome] = [];

agrupado[nome].push({
...o,
comissaoCalculada:comissao
});

});

setDados(agrupado);

setResumoFinanceiro({

brutoTotal,
totalComissoes,
lucroLiquido: brutoTotal - totalComissoes

});

setLoading(false);

}

/* =========================
CANCELAR ORDEM
========================= */

async function cancelarOrdem(id){

const confirmar = window.confirm("Cancelar ordem?");

if(!confirmar) return;

await supabase
.from("ordens_servico")
.update({status:"cancelado"})
.eq("id",id);

buscarPendentes();

}

/* =========================
UTILS
========================= */

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

function formatarData(data){

if(!data) return "-";

return new Date(data+"T00:00:00")
.toLocaleDateString("pt-BR");

}

/* =========================
FILTRO CLIENTE
========================= */

function filtrarOrdens(ordens){

if(!buscaCliente) return ordens;

return ordens.filter(o=>
o.clientes?.nome_cliente
?.toLowerCase()
.includes(buscaCliente.toLowerCase())
);

}

return(

<div className="min-h-screen bg-gray-100 p-6">

<div className="flex justify-between items-center mb-6">

<button
onClick={()=>navigate("/admin")}
className="text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<button
onClick={()=>{

const novoModo = modo==="pendentes" ? "finalizados" : "pendentes";

setModo(novoModo);
setDados({});
setExpandido(null);

if(novoModo==="pendentes"){
buscarPendentes();
}

}}
className="bg-blue-600 text-white px-4 py-2 rounded-lg"
>
{modo==="pendentes"
?"Ver serviços finalizados"
:"Ver serviços pendentes"}
</button>

</div>

<h2 className="text-3xl font-bold mb-6">

{modo==="pendentes"
?"Serviços Pendentes"
:"Relatório Financeiro"}

</h2>

{/* FILTROS */}

<div className="flex flex-wrap gap-4 mb-6">

{modo==="finalizados" && (

<>

<input
type="month"
value={mesSelecionado}
onChange={e=>aplicarFiltroMes(e.target.value)}
className="p-2 border rounded"
/>

<input
type="date"
value={dataInicio}
onChange={e=>setDataInicio(e.target.value)}
className="p-2 border rounded"
/>

<input
type="date"
value={dataFim}
onChange={e=>setDataFim(e.target.value)}
className="p-2 border rounded"
/>

<select
value={funcionarioSelecionado}
onChange={e=>setFuncionarioSelecionado(e.target.value)}
className="p-2 border rounded"
>

<option value="">Todos funcionários</option>

{funcionarios.map(f=>(

<option key={f.id} value={f.id}>
{f.nome}
</option>

))}

</select>

</>

)}

<input
type="text"
placeholder="Buscar cliente..."
value={buscaCliente}
onChange={e=>setBuscaCliente(e.target.value)}
className="p-2 border rounded"
/>

<button
onClick={buscar}
className="bg-green-600 text-white px-6 py-2 rounded-lg"
>
🔎 Buscar
</button>

</div>

{/* RESUMO */}

{modo==="finalizados" && (

<div className="bg-white p-6 rounded-xl shadow mb-6">

<p>
<strong>Faturamento bruto:</strong> {formatar(resumoFinanceiro.brutoTotal)}
</p>

<p>
<strong>Total comissões:</strong> {formatar(resumoFinanceiro.totalComissoes)}
</p>

<p className="text-xl font-bold text-green-600">
Lucro líquido: {formatar(resumoFinanceiro.lucroLiquido)}
</p>

</div>

)}

{loading && <p>Carregando...</p>}

{/* LISTA */}

{!loading && Object.entries(dados).map(([nome,ordens])=>{

const filtradas = filtrarOrdens(ordens);

if(filtradas.length===0) return null;

return(

<div key={nome} className="bg-white p-6 rounded-xl shadow-md mb-4">

<h4
className="font-bold cursor-pointer"
onClick={()=>setExpandido(expandido===nome?null:nome)}
>
{nome} ({filtradas.length} serviços)
</h4>

{expandido===nome && (

<div className="mt-4 space-y-2">

{filtradas.map(o=>(

<div key={o.id} className="border p-3 rounded-lg">

<p>
<strong>Cliente:</strong> {o.clientes?.nome_cliente}
</p>

<p>
<strong>Pet:</strong> {o.clientes?.nome_pet}
</p>

<p>
<strong>Serviço:</strong> {o.tipo_servico}
</p>

<p>
<strong>Valor:</strong> {formatar(o.valor)}
</p>

<p>
<strong>Data:</strong> {formatarData(o.data_finalizacao)}
</p>

<p><strong>Observação: </strong>{o.observacoes}</p>

{modo==="pendentes" && (

<button
onClick={()=>cancelarOrdem(o.id)}
className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg"
>
Cancelar Ordem
</button>

)}

</div>

))}

</div>

)}

</div>

);

})}

</div>

);

}