import { useEffect, useState } from "react";
import { Plus, UserCheck, UserX, AlertCircle, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/utils/formatters";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

const createUserSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  email: z.string().email("Email no válido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
  isSuperAdmin: z.boolean(),
});

const credentialsSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria."),
  newPassword: z.string().min(8, "Mínimo 8 caracteres."),
  newEmail: z.string().email("Email no válido.").optional().or(z.literal("")),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type CredentialsForm = z.infer<typeof credentialsSchema>;

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { isSuperAdmin: false },
  });

  const {
    register: registerCreds,
    handleSubmit: handleSubmitCreds,
    reset: resetCreds,
    formState: { errors: errorsCreds, isSubmitting: isSubmittingCreds },
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data);
      } catch {
        setActionError("No se pudieron cargar los administradores.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreate = async (data: CreateUserForm) => {
    try {
      setActionError(null);
      const { data: newUser } = await api.post("/admin/users", data);
      setUsers((prev) => [...prev, newUser]);
      resetCreate();
      setShowCreateForm(false);
      showSuccess("Administrador creado correctamente.");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo crear el administrador.",
      );
    }
  };

  const handleToggleActive = async (id: number, currentlyActive: boolean) => {
    try {
      setActionError(null);
      await api.put(`/admin/users/${id}/deactivate`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: !currentlyActive } : u,
        ),
      );
      showSuccess(
        `Administrador ${currentlyActive ? "desactivado" : "activado"} correctamente.`,
      );
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ?? "No se pudo cambiar el estado.",
      );
    }
  };

  const handleUpdateCredentials = async (data: CredentialsForm) => {
    try {
      setActionError(null);
      await api.put("/admin/users/me/credentials", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        newEmail: data.newEmail || undefined,
      });
      resetCreds();
      setShowCredentialsForm(false);
      showSuccess("Credenciales actualizadas correctamente.");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(
        error.response?.data?.message ??
          "No se pudieron actualizar las credenciales.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            Administradores
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} administradores registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCredentialsForm(!showCredentialsForm);
              setShowCreateForm(false);
            }}
            className="flex items-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
          >
            <KeyRound size={16} />
            Mis credenciales
          </button>
          {currentUser?.isSuperAdmin && (
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setShowCredentialsForm(false);
              }}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              <Plus size={16} />
              Nuevo admin
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-red-400"
          >
            ✕
          </button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-600 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Formulario crear admin */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-yellow-200">
          <h2 className="font-semibold text-[#1a1a2e] mb-5">
            Crear nuevo administrador
          </h2>
          <form
            onSubmit={handleSubmitCreate(handleCreate)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...registerCreate("name")}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreate.name
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                  placeholder="Nombre completo"
                />
                {errorsCreate.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreate.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...registerCreate("email")}
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreate.email
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                  placeholder="admin@memoirenomade.com"
                />
                {errorsCreate.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreate.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  {...registerCreate("password")}
                  type="password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreate.password
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                {errorsCreate.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreate.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  {...registerCreate("isSuperAdmin")}
                  type="checkbox"
                  className="w-4 h-4 accent-yellow-500"
                />
                <label className="text-sm text-gray-700">
                  Conceder permisos de Superadmin
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreate();
                }}
                className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingCreate}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isSubmittingCreate && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1a1a2e] border-t-transparent" />
                )}
                Crear administrador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario mis credenciales */}
      {showCredentialsForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-blue-200">
          <h2 className="font-semibold text-[#1a1a2e] mb-5">
            Actualizar mis credenciales
          </h2>
          <form
            onSubmit={handleSubmitCreds(handleUpdateCredentials)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual *
                </label>
                <input
                  {...registerCreds("currentPassword")}
                  type="password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreds.currentPassword
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                />
                {errorsCreds.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreds.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña *
                </label>
                <input
                  {...registerCreds("newPassword")}
                  type="password"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreds.newPassword
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                {errorsCreds.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreds.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo email <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  {...registerCreds("newEmail")}
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                    errorsCreds.newEmail
                      ? "border-red-300"
                      : "border-gray-200 focus:border-yellow-400"
                  }`}
                  placeholder="nuevo@email.com"
                />
                {errorsCreds.newEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errorsCreds.newEmail.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCredentialsForm(false);
                  resetCreds();
                }}
                className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingCreds}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isSubmittingCreds && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1a1a2e] border-t-transparent" />
                )}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de administradores */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    user.isSuperAdmin
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1a1a2e] text-sm">
                      {user.name}
                    </p>
                    {user.isSuperAdmin && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
                        Superadmin
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">
                        Inactivo
                      </span>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full font-medium">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Desde {formatDate(user.createdAt.split("T")[0])}
                  </p>
                </div>
              </div>

              {/* Acción activar/desactivar (solo superadmin, no a sí mismo) */}
              {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
                <button
                  onClick={() => handleToggleActive(user.id, user.isActive)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                    user.isActive
                      ? "text-red-500 hover:bg-red-50 border-2 border-red-200"
                      : "text-green-600 hover:bg-green-50 border-2 border-green-200"
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <UserX size={16} /> Desactivar
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} /> Activar
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
