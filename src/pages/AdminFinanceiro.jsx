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

  const [adiantamento,setAdiantamento] = useState("");

  const [descricao,setDescricao] = useState("");

  const [resultado,setResultado] = useState(null);

  useEffect(()=>{
    buscarFuncionarios();
  },[])

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

  async function registrarAdiantamento(){

    if(!funcionario || !adiantamento) return;

    await supabase
    .from("adiantamentos_funcionarios")
    .insert({
      funcionario_id:funcionario,
      valor:adiantamento,
      descricao:descricao
    });

    alert("Adiantamento registrado");

    setAdiantamento("");
    setDescricao("");

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

    })

    const {data:adiantamentos} = await supabase
    .from("adiantamentos_funcionarios")
    .select("valor")
    .eq("funcionario_id",funcionario)
    .gte("data",dataInicio)
    .lte("data",dataFim);

    let totalAdiantamentos = 0;

    adiantamentos?.forEach(a=>{
      totalAdiantamentos += Number(a.valor);
    })

    setResultado({

      comissao:totalComissao,
      adiantamentos:totalAdiantamentos,
      pagar: totalComissao - totalAdiantamentos

    });

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
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

      <h2 className="text-3xl font-bold mb-8">
        Financeiro Funcionários
      </h2>

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

        </div>

      )}

      <div className="bg-white p-6 rounded shadow">

        <h3 className="text-xl font-bold mb-4">
          Registrar Adiantamento
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          <input
          type="number"
          placeholder="Valor"
          value={adiantamento}
          onChange={e=>setAdiantamento(e.target.value)}
          className="p-2 border rounded"
          />

          <input
          placeholder="Descrição"
          value={descricao}
          onChange={e=>setDescricao(e.target.value)}
          className="p-2 border rounded"
          />

          <button
          onClick={registrarAdiantamento}
          className="bg-green-600 text-white rounded"
          >
          Registrar
          </button>

        </div>

      </div>

    </div>

  )

}