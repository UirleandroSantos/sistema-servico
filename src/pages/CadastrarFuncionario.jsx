import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function CadastrarFuncionario() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Digite o nome do funcionário");
      return;
    }

    setLoading(true);

    const emailFake = `${nome.replace(/\s/g, "").toLowerCase()}@empresa.com`;

    const { data, error } = await supabase.auth.signUp({
      email: emailFake,
      password: "123456",
    });

    if (error || !data?.user) {
      alert("Erro ao criar funcionário");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        nome: nome,
        role: "membro",
        primeiro_login: true,
      },
    ]);

    if (profileError) {
      alert("Funcionário criado, mas erro ao salvar perfil");
      setLoading(false);
      return;
    }

    alert("Funcionário criado com senha padrão: 123456");

    setNome("");
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
            placeholder="Nome do Funcionário"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
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