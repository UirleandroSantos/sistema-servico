import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function CadastrarFuncionario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const { nome, sobrenome, telefone, email } = form;

    if (!nome || !sobrenome || !telefone || !email) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    // Criar usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: "123456",
    });

    if (error || !data?.user) {
      alert("Erro ao criar usuário");
      setLoading(false);
      return;
    }

    // Criar profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          nome: nome,
          sobrenome: sobrenome,
          telefone: telefone,
          email: email,
          role: "membro",
          primeiro_login: true,
          comissao: 0,
        },
      ]);

    if (profileError) {
      alert("Usuário criado, mas erro ao salvar perfil");
      setLoading(false);
      return;
    }

    alert("Funcionário criado com senha padrão: 123456");

    setForm({
      nome: "",
      sobrenome: "",
      telefone: "",
      email: "",
    });

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Novo Funcionário
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Sobrenome"
            value={form.sobrenome}
            onChange={(e) =>
              setForm({ ...form, sobrenome: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) =>
              setForm({ ...form, telefone: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Funcionário"}
          </button>

        </form>
      </div>
    </div>
  );
}