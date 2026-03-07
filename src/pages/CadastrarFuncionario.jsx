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
    comissao: 0
  });

  const [loading, setLoading] = useState(false);

  async function criarFuncionario(e) {

    e.preventDefault();

    const { nome, sobrenome, telefone, email, comissao } = form;

    if (!nome || !sobrenome || !telefone || !email) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {

      // tenta criar usuário
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: "123456"
      });

      if (error && !error.message.includes("already registered")) {
        throw error;
      }

      const user = data?.user || data?.session?.user;

      if (!user) {
        alert("Usuário já existe no Auth. Criando perfil...");
      }

      const userId = user?.id;

      // verifica se profile já existe
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        alert("Funcionário já existe.");
        setLoading(false);
        return;
      }

      // cria profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            nome,
            sobrenome,
            telefone,
            email,
            role: "membro",
            primeiro_login: true,
            comissao
          }
        ]);

      if (profileError) throw profileError;

      alert("Funcionário criado!\nSenha padrão: 123456");

      navigate("/admin/funcionarios");

    } catch (err) {

      console.error(err);
      alert("Erro ao criar funcionário");

    }

    setLoading(false);

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex justify-center items-center p-6">

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-xl">

        <button
          onClick={() => navigate("/admin/funcionarios")}
          className="text-blue-600 hover:underline mb-6"
        >
          ← Voltar
        </button>

        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          👨‍🔧 Novo Funcionário
        </h2>

        <form onSubmit={criarFuncionario} className="space-y-5">

          <input
            placeholder="Nome"
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />

          <input
            placeholder="Sobrenome"
            value={form.sobrenome}
            onChange={(e) =>
              setForm({ ...form, sobrenome: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />

          <input
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) =>
              setForm({ ...form, telefone: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="number"
            placeholder="Comissão (%)"
            value={form.comissao}
            onChange={(e) =>
              setForm({ ...form, comissao: e.target.value })
            }
            className="w-full p-3 border rounded-xl"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg"
          >
            {loading ? "Criando..." : "Criar Funcionário"}
          </button>

        </form>

      </div>

    </div>

  );

}