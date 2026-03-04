import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function TrocarSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^\d{6}$/.test(novaSenha)) {
      alert("A senha deve conter exatamente 6 números.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      alert("Erro ao atualizar senha");
      return;
    }

    const { data } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({ primeiro_login: false })
      .eq("id", data.user.id);

    alert("Senha atualizada com sucesso!");
    navigate("/equipe");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Criar Nova Senha
        </h2>

        <input
          type="password"
          placeholder="Nova senha (6 números)"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Salvar Nova Senha
        </button>
      </form>
    </div>
  );
}