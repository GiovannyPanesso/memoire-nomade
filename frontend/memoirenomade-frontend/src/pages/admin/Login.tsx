import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("El email no es válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null);
      const result = await authService.login(data.email, data.password);
      login(result.accessToken, result.user);
      navigate("/admin/dashboard");
    } catch {
      setServerError(
        "Credenciales incorrectas. Verifica tu email y contraseña.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-yellow-400 font-serif text-3xl font-bold">
            Mémoire Nomade
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Panel de Administración</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-yellow-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1a1a2e]">
              Iniciar sesión
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@memoirenomade.com"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                  errors.email
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors pr-12 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1a1a2e] border-t-transparent" />
              ) : (
                "Entrar al panel"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} Mémoire Nomade
        </p>
      </div>
    </div>
  );
}
