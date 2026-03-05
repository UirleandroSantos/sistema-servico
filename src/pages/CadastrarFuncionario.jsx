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

    // cria usuário no AUTH
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: "123456"
    });

    if (error) {
      alert("Erro ao criar usuário");
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Erro ao criar usuário");
      setLoading(false);
      return;
    }

    // cria profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          nome: nome,
          sobrenome: sobrenome,
          telefone: telefone,
          email: email,
          role: "membro",
          primeiro_login: true,
          comissao: comissao
        }
      ]);

    if (profileError) {
      alert("Usuário criado mas erro ao salvar perfil");
      setLoading(false);
      return;
    }

    alert("Funcionário criado!\nSenha padrão: 123456");

    navigate("/admin/funcionarios");

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
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Sobrenome"
            value={form.sobrenome}
            onChange={(e) =>
              setForm({ ...form, sobrenome: e.target.value })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          <input
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) =>
              setForm({ ...form, telefone: e.target.value })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="number"
            placeholder="Comissão (%)"
            value={form.comissao}
            onChange={(e) =>
              setForm({ ...form, comissao: e.target.value })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
          >
            {loading ? "Criando..." : "Criar Funcionário"}
          </button>

        </form>

      </div>

    </div>

  );

}