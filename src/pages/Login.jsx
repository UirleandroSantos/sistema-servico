import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (manterConectado) {
      localStorage.setItem("manterLogado", "true");
    } else {
      localStorage.removeItem("manterLogado");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, primeiro_login")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      alert("Perfil não encontrado.");
      return;
    }

    if (profile.primeiro_login) {
      navigate("/trocar-senha");
      return;
    }

    if (profile.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/equipe");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4">

      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-6 sm:p-10 rounded-2xl shadow-2xl"
      >

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
          Sistema de Serviços
        </h2>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={manterConectado}
              onChange={() => setManterConectado(!manterConectado)}
            />
            Manter-me conectado
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
          >
            Entrar
          </button>

        </div>

      </form>

    </div>
  );
}