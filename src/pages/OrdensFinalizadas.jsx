import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function OrdensFinalizadas(){

const navigate = useNavigate();
const [jaPago,setJaPago] = useState(false);

const hoje = new Date();
const dataAtual = hoje.toISOString().split("T")[0];

const primeiroDiaMes = new Date(
  hoje.getFullYear(),
  hoje.getMonth(),
  1
).toISOString().split("T")[0];

const [funcionarios,setFuncionarios] = useState([]);
const [funcionarioSelecionado,setFuncionarioSelecionado] = useState(null);

const [dataInicial,setDataInicial] = useState(primeiroDiaMes);
const [dataFinal,setDataFinal] = useState(dataAtual);

const [servicos,setServicos] = useState([]);

const [valorBruto,setValorBruto] = useState(0);
const [despesas,setDespesas] = useState(0);
const [vales,setVales] = useState(0);
const [liquido,setLiquido] = useState(0);

/* BUSCAR FUNCIONÁRIOS */

useEffect(()=>{
buscarFuncionarios();
},[]);

/* REALTIME */

useEffect(() => {

  const channel = supabase
    .channel("realtime-ordens-finalizadas")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ordens_servico"
      },
      () => {
        buscarDados();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };

}, [funcionarioSelecionado, dataInicial, dataFinal]);

async function buscarFuncionarios(){

const { data,error } = await supabase
.from("profiles")
.select("id,nome,role")
.eq("role","membro");

if(error){
console.log(error);
return;
}

setFuncionarios(data || []);

}

/* BUSCAR DADOS */

async function buscarDados(){

if(!funcionarioSelecionado) return;

setServicos([]);

const inicio = `${dataInicial}T00:00:00`;
const fim = `${dataFinal}T23:59:59`;

const { data:servicosData,error } = await supabase
.from("ordens_servico")
.select(`
id,
valor,
tipo_servico,
data_finalizacao,
pago_funcionario,
clientes(
nome_cliente,
nome_pet
)
`)
.eq("status","finalizado")
.eq("funcionario_id",funcionarioSelecionado.id)
.gte("data_finalizacao",inicio)
.lte("data_finalizacao",fim)
.order("data_finalizacao",{ascending:false});

if(error){
console.log("Erro ao buscar serviços:",error);
setServicos([]);
return;
}

setServicos(servicosData ?? []);

/* VERIFICAR SE JÁ FOI PAGO */

let pago = true;

(servicosData || []).forEach(s=>{
if(!s.pago_funcionario){
pago = false;
}
});

setJaPago(pago && (servicosData || []).length > 0);

/* CALCULAR BRUTO */

let bruto = 0;

(servicosData || []).forEach(s=>{
bruto += Number(s.valor);
});

setValorBruto(bruto);

/* BUSCAR DESPESAS */

const { data:despesasData } = await supabase
.from("despesas_funcionarios")
.select("*")
.eq("funcionario_id",funcionarioSelecionado.id)
.gte("data",dataInicial)
.lte("data",dataFinal);

let totalDespesas = 0;
let totalVales = 0;

(despesasData || []).forEach(d=>{

if(d.tipo === "despesa"){
totalDespesas += Number(d.valor);
}

if(d.tipo === "vale"){
totalVales += Number(d.valor);
}

});

setDespesas(totalDespesas);
setVales(totalVales);

const liquidoCalculado = (bruto / 2) - totalDespesas - totalVales;

setLiquido(liquidoCalculado);

}

function formatar(valor){

return Number(valor).toLocaleString("pt-BR",{
style:"currency",
currency:"BRL"
});

}

/* TELA DE FUNCIONÁRIOS */

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

/* TELA PRINCIPAL */

return(

<div className="p-6 max-w-md mx-auto">

<button
onClick={()=>setFuncionarioSelecionado(null)}
className="text-blue-600 mb-4"
>
← Voltar
</button>

<h2 className="text-xl font-bold mb-4">
{funcionarioSelecionado.nome}
</h2>

<div className="flex flex-col gap-2 mb-6">

<label className="text-sm">Data inicial</label>

<input
type="date"
value={dataInicial}
onChange={e=>setDataInicial(e.target.value)}
className="p-2 border rounded"
/>

<label className="text-sm">Data final</label>

<input
type="date"
value={dataFinal}
onChange={e=>setDataFinal(e.target.value)}
className="p-2 border rounded"
/>

<button
onClick={buscarDados}
className="bg-green-600 text-white py-2 rounded"
>
Buscar
</button>

</div>

<div className="border rounded p-4 bg-white shadow mb-4">

<p className="text-sm mb-1">
Serviços finalizados: {servicos.length}
</p>

<hr className="my-2"/>

<p className="text-lg font-bold">
Valor bruto: {formatar(valorBruto)}
</p>

{jaPago && (

<div className="mt-4 bg-green-100 border border-green-300 text-green-700 p-3 rounded text-center font-semibold">
✔ Pagamento já realizado neste período
</div>

)}

</div>

<div className="flex flex-col gap-3">

{servicos.map(s=>(

<div
key={s.id}
className="border rounded p-3 bg-white shadow"
>

<p className="text-sm font-semibold">
Cliente: {s.clientes?.nome_cliente}
</p>

<p className="text-sm font-semibold">
Pet: {s.clientes?.nome_pet}
</p>

<p className="text-sm">
Serviço: {s.tipo_servico}
</p>

<p className="text-sm">
Valor: {formatar(s.valor)}
</p>

<p className="text-xs text-gray-500">
Finalizado em: {new Date(s.data_finalizacao).toLocaleDateString("pt-BR")}
</p>

</div>

))}

</div>

</div>

)

}