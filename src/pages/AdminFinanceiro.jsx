import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function AdminFinanceiro() {

const navigate = useNavigate();

const [modo,setModo] = useState("salarios");

const [funcionarios,setFuncionarios] = useState([]);
const [funcionario,setFuncionario] = useState("");

const [mes,setMes] = useState("");
const [dataInicio,setDataInicio] = useState("");
const [dataFim,setDataFim] = useState("");

const [resultado,setResultado] = useState(null);

const [resultadosTodos,setResultadosTodos] = useState([]);

const [contasReceber,setContasReceber] = useState([]);
const [totalReceber,setTotalReceber] = useState(0);

useEffect(()=>{
buscarFuncionarios();
},[]);

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome")
.neq("role","admin")

setFuncionarios(data || []);

}

function aplicarMes(valor){

setMes(valor);

if(!valor) return;

const [ano,mesNumero] = valor.split("-");

const inicio = `${ano}-${mesNumero}-01`;

const fim = new Date(ano,mesNumero,0)
.toISOString()
.split("T")[0];

setDataInicio(inicio);
setDataFim(fim);

}

async function calcular(){

if(!funcionario) return;

const {data:ordens} = await supabase
.from("ordens_servico")
.select(`
valor,
profiles(comissao)
`)
.eq("funcionario_id",funcionario)
.eq("status","finalizado")
.gte("data_finalizacao",dataInicio)
.lte("data_finalizacao",dataFim);

let totalComissao = 0;

ordens?.forEach(o=>{

const porcentagem = o.profiles?.comissao || 0;

totalComissao += (o.valor * porcentagem) / 100;

});

const {data:despesas} = await supabase
.from("despesas_funcionarios")
.select("valor")
.eq("funcionario_id",funcionario)
.gte("data",dataInicio)
.lte("data",dataFim);

let totalDespesas = 0;

despesas?.forEach(d=>{
totalDespesas += Number(d.valor);
});

const totalPagar = totalComissao - totalDespesas;

setResultado({

comissao:totalComissao,
despesas:totalDespesas,
pagar: totalPagar

});

}

async function calcularTodos(){

let lista = [];

for(const f of funcionarios){

const {data:ordens} = await supabase
.from("ordens_servico")
.select(`
valor,
profiles(comissao)
`)
.eq("funcionario_id",f.id)
.eq("status","finalizado")
.gte("data_finalizacao",dataInicio)
.lte("data_finalizacao",dataFim);

let totalComissao = 0;

ordens?.forEach(o=>{

const porcentagem = o.profiles?.comissao || 0;

totalComissao += (o.valor * porcentagem) / 100;

});

const {data:despesas} = await supabase
.from("despesas_funcionarios")
.select("valor")
.eq("funcionario_id",f.id)
.gte("data",dataInicio)
.lte("data",dataFim);

let totalDespesas = 0;

despesas?.forEach(d=>{
totalDespesas += Number(d.valor);
});

const totalPagar = totalComissao - totalDespesas;

lista.push({

id:f.id,
nome:f.nome,
comissao:totalComissao,
despesas:totalDespesas,
pagar:totalPagar

});

}

setResultadosTodos(lista);

}

async function buscarContasReceber(){

if(!dataInicio || !dataFim){

alert("Selecione período");

return;

}

const {data} = await supabase
.from("ordens_servico")
.select(`
valor,
tipo_servico,
data_finalizacao,
clientes(nome_cliente)
`)
.eq("status","finalizado")
.gte("data_finalizacao",dataInicio)
.lte("data_finalizacao",dataFim);

const agrupado = {};

let total = 0;

data?.forEach(o=>{

const cliente = o.clientes?.nome_cliente || "Sem nome";

if(!agrupado[cliente]){

agrupado[cliente] = {
cliente,
total:0,
servicos:[]
};

}

agrupado[cliente].servicos.push({

servico:o.tipo_servico,
valor:o.valor,
data:o.data_finalizacao

});

agrupado[cliente].total += Number(o.valor);

total += Number(o.valor);

});

setContasReceber(Object.values(agrupado));

setTotalReceber(total);

}

function exportarPDF(cliente){

const pdf = new jsPDF();

let y = 20;

pdf.setFontSize(18);
pdf.text("PET SHOP - COBRANÇA DE SERVIÇOS",20,y);

y += 15;

pdf.setFontSize(12);
pdf.text(`Cliente: ${cliente.cliente}`,20,y);

y += 10;

pdf.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`,20,y);

y += 15;

pdf.text("Serviços realizados:",20,y);

y += 10;

cliente.servicos.forEach((s)=>{

const dataFormatada = s.data.split("-").reverse().join("/");

pdf.text(`${dataFormatada} - ${s.servico} - ${formatar(s.valor)}`,20,y);

y += 8;

});

y += 10;

pdf.setFontSize(14);
pdf.text(`TOTAL: ${formatar(cliente.total)}`,20,y);

y += 20;

pdf.setFontSize(10);
pdf.text("Obrigado pela preferência!",20,y);

pdf.save(`cobranca_${cliente.cliente}.pdf`);

}

async function registrarPagamento(){

if(!resultado) return;

await supabase
.from("pagamentos_funcionarios")
.insert({

funcionario_id: funcionario,
data_inicio: dataInicio,
data_fim: dataFim,
total_comissao: resultado.comissao,
total_despesas: resultado.despesas,
total_pago: resultado.pagar,
pago:true

});

/* APAGAR DESPESAS DO PERÍODO */

await supabase
.from("despesas_funcionarios")
.delete()
.eq("funcionario_id",funcionario)
.gte("data",dataInicio)
.lte("data",dataFim);

alert("Pagamento registrado e despesas zeradas");

setResultado(null);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

return(

<div className="p-8">

<button
onClick={()=>navigate(-1)}
className="mb-6 text-sm text-blue-600 hover:underline"
>
← Voltar
</button>

<h2 className="text-3xl font-bold mb-6">
Financeiro
</h2>

<div className="flex gap-4 mb-10">

<button
onClick={()=>setModo("salarios")}
className={`px-6 py-2 rounded ${modo==="salarios" ? "bg-blue-700 text-white":"bg-gray-300"}`}
>
Calcular salários
</button>

<button
onClick={()=>setModo("receber")}
className={`px-6 py-2 rounded ${modo==="receber" ? "bg-green-700 text-white":"bg-gray-300"}`}
>
Ver contas a receber
</button>

</div>

{modo === "salarios" && (

<div>

<div className="grid md:grid-cols-4 gap-4 mb-8">

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
type="month"
value={mes}
onChange={e=>aplicarMes(e.target.value)}
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

</div>

<button
onClick={calcular}
className="bg-blue-600 text-white px-6 py-2 rounded mb-6"
>
Calcular
</button>

<button
onClick={calcularTodos}
className="bg-purple-700 text-white px-6 py-2 rounded mb-10 ml-4"
>
Calcular todos
</button>

{resultado && (

<div className="bg-white p-6 rounded shadow mb-8">

<p>
<strong>Total Bruto:</strong> {formatar(resultado.comissao * 2)}
</p>

<p>
<strong>Despesas:</strong> {formatar(resultado.despesas)}
</p>

<p className="text-xl font-bold text-green-600">
Total a pagar: {formatar(resultado.pagar)}
</p>

<button
onClick={registrarPagamento}
className="bg-green-600 text-white px-6 py-2 rounded mt-4"
>
Marcar salário como pago
</button>

</div>

)}

{resultadosTodos.length > 0 && (

<div className="grid md:grid-cols-3 gap-6">

{resultadosTodos.map((r,i)=>(

<div key={i} className="bg-white p-6 rounded shadow">

<h3 className="text-xl font-bold mb-4">
{r.nome}
</h3>

<p>
<strong>Comissão:</strong> {formatar(r.comissao)}
</p>

<p>
<strong>Despesas:</strong> {formatar(r.despesas)}
</p>

<p className="text-green-700 font-bold text-lg">
Total a pagar: {formatar(r.pagar)}
</p>

</div>

))}

</div>

)}

</div>

)}

{modo === "receber" && (

<div>

<div className="grid md:grid-cols-3 gap-4 mb-8">

<input
type="month"
value={mes}
onChange={e=>aplicarMes(e.target.value)}
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

</div>

<button
onClick={buscarContasReceber}
className="bg-green-700 text-white px-6 py-2 rounded mb-8"
>
Buscar
</button>

{contasReceber.length > 0 && (

<div className="bg-white p-6 rounded shadow">

<h3 className="text-2xl font-bold mb-6">
Contas a Receber
</h3>

{contasReceber.map((c,i)=>(

<div key={i} className="border-b pb-4 mb-4">

<p className="font-bold text-lg">
Cliente: {c.cliente}
</p>

<p className="text-green-700 font-semibold">
Total: {formatar(c.total)}
</p>

<button
onClick={()=>exportarPDF(c)}
className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
>
Exportar PDF cobrança
</button>

</div>

))}

<p className="text-2xl font-bold mt-6">
Total Geral: {formatar(totalReceber)}
</p>

</div>

)}

</div>

)}

</div>

);

}