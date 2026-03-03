import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function CadastrarCliente() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome_cliente: "",
    nome_pet: "",
    endereco: "",
    apartamento: "",
    telefone: "",
    observacoes: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("clientes").insert([form]);

    if (error) {
      alert("Erro ao cadastrar cliente");
    } else {
      alert("Cliente cadastrado com sucesso!");
      setForm({
        nome_cliente: "",
        nome_pet: "",
        endereco: "",
        apartamento: "",
        telefone: "",
        observacoes: "",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Novo Cliente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            value={form.nome_cliente}
            placeholder="Nome do Cliente"
            onChange={(e) =>
              setForm({ ...form, nome_cliente: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={form.nome_pet}
            placeholder="Nome do Pet"
            onChange={(e) =>
              setForm({ ...form, nome_pet: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={form.endereco}
            placeholder="Endereço"
            onChange={(e) =>
              setForm({ ...form, endereco: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={form.apartamento}
            placeholder="Apartamento"
            onChange={(e) =>
              setForm({ ...form, apartamento: e.target.value })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={form.telefone}
            placeholder="Telefone"
            onChange={(e) =>
              setForm({ ...form, telefone: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            value={form.observacoes}
            placeholder="Observações (opcional)"
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Salvar Cliente
          </button>

        </form>
      </div>
    </div>
  );
}