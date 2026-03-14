import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminOrdens() {

  const navigate = useNavigate();

  const [dados,setDados] = useState({});
  const [buscaCliente,setBuscaCliente] = useState("");
  const [expandido,setExpandido] = useState(null);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    buscarPendentes();
  },[]);

  /* =========================
  BUSCAR ORDENS PENDENTES
  ========================= */
  async function buscarPendentes(){

    setDados({});
    setLoading(true);

    const {data,error} = await supabase
      .from("ordens_servico")
      .select(`
        *,
        clientes(nome_cliente,nome_pet),
        profiles(nome)
      `)
      .eq("status","pendente");

    if(error){
      console.log(error);
      setLoading(false);
      return;
    }

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
  FILTRO CLIENTE
  ========================= */
  function filtrarOrdens(ordens){

    if(!buscaCliente) return ordens;

    return ordens.filter(o=>
      o.clientes?.nome_cliente?.toLowerCase()
      .includes(buscaCliente.toLowerCase())
    );

  }

  function formatar(valor){

    return Number(valor).toLocaleString("pt-BR",{
      style:"currency",
      currency:"BRL"
    });

  }

  return(

    <div className="min-h-screen bg-gray-100 p-6">

      <button
        onClick={()=>navigate("/admin")}
        className="text-sm text-blue-600 hover:underline mb-6"
      >
        ← Voltar
      </button>

      <h2 className="text-3xl font-bold mb-6">
        Ordens Pendentes
      </h2>

      <div className="flex gap-4 mb-6">

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={buscaCliente}
          onChange={e=>setBuscaCliente(e.target.value)}
          className="p-2 border rounded"
        />

        <button
          onClick={buscarPendentes}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Buscar
        </button>

      </div>

      {loading && <p>Carregando...</p>}

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

                    <p><strong>Cliente:</strong> {o.clientes?.nome_cliente}</p>
                    <p><strong>Pet:</strong> {o.clientes?.nome_pet}</p>
                    <p><strong>Serviço:</strong> {o.tipo_servico}</p>
                    <p><strong>Valor:</strong> {formatar(o.valor)}</p>
                    <p><strong>Observação:</strong> {o.observacoes}</p>

                    <button
                      onClick={()=>cancelarOrdem(o.id)}
                      className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      Cancelar Ordem
                    </button>

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