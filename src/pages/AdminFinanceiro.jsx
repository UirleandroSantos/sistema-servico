import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminFinanceiro() {

const navigate = useNavigate();

const [funcionarios,setFuncionarios] = useState([]);
const [funcionario,setFuncionario] = useState("");

const [mes,setMes] = useState("");
const [dataInicio,setDataInicio] = useState("");
const [dataFim,setDataFim] = useState("");

const [resultado,setResultado] = useState(null);

useEffect(()=>{
buscarFuncionarios();
},[]);

async function buscarFuncionarios(){

const {data} = await supabase
.from("profiles")
.select("id,nome");

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

const {data:adiantamentos} = await supabase
.from("adiantamentos_funcionarios")
.select("valor")
.eq("funcionario_id",funcionario)
.eq("descontado",false)
.gte("data",dataInicio)
.lte("data",dataFim);

let totalAdiantamentos = 0;

adiantamentos?.forEach(a=>{
totalAdiantamentos += Number(a.valor);
});

/* ALTERAÇÃO: cálculo do valor final */
const totalPagar = totalComissao - totalAdiantamentos;

setResultado({

comissao:totalComissao,
adiantamentos:totalAdiantamentos,
pagar: totalPagar

});

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

total_adiantamentos: resultado.adiantamentos,

total_pago: resultado.pagar,

pago:true

});

await supabase
.from("adiantamentos_funcionarios")
.update({descontado:true})
.eq("funcionario_id",funcionario)
.gte("data",dataInicio)
.lte("data",dataFim);

alert("Pagamento registrado no histórico");

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
Financeiro Funcionários
</h2>

<div className="flex gap-4 mb-8">

<button
onClick={()=>navigate("/adiantamentos")}
className="bg-gray-800 text-white px-4 py-2 rounded"
>
Histórico de Adiantamentos
</button>

<button
onClick={()=>navigate("/historico-pagamentos")}
className="bg-indigo-700 text-white px-4 py-2 rounded"
>
Histórico de Pagamentos
</button>

</div>

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
className="bg-blue-600 text-white px-6 py-2 rounded mb-10"
>
Calcular
</button>

{resultado && (

<div className="bg-white p-6 rounded shadow mb-10">

<p>
<strong>Total Comissões:</strong> {formatar(resultado.comissao)}
</p>

<p>
<strong>Adiantamentos:</strong> {formatar(resultado.adiantamentos)}
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

</div>

);

}