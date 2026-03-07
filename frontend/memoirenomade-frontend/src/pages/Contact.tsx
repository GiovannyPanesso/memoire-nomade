import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import api from "@/services/api";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("El email no es válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      setServerError(null);
      await api.post("/contact", data);
      setSent(true);
      reset();
    } catch {
      setServerError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] py-16">
        <div className="container-app text-center">
          <h1 className="text-white font-serif text-4xl md:text-5xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            ¿Tienes alguna pregunta? Estamos encantados de ayudarte a planificar
            tu experiencia en París.
          </p>
        </div>
      </div>

      <div className="container-app py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* ── Información de contacto ───────────────────────── */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#1a1a2e] mb-6">
              Estamos aquí para ayudarte
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Puedes escribirnos a través del formulario o contactarnos
              directamente por email o teléfono. Respondemos en menos de 24
              horas.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e]">Email</p>
                  <a
                    href="mailto:info@memoirenomade.com"
                    className="text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    info@memoirenomade.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e]">Teléfono</p>
                  <a
                    href="tel:+33600000000"
                    className="text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    +33 6 00 00 00 00
                  </a>
                  <p className="text-xs text-gray-400 mt-1">
                    Lunes a viernes, 9:00 — 18:00 (CET/CEST)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e]">Ubicación</p>
                  <p className="text-gray-500">París, Francia</p>
                  <p className="text-xs text-gray-400 mt-1">
                    El punto de encuentro se confirma tras la reserva.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Formulario ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1a1a2e] mb-2">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-gray-500 mb-6">
                  Gracias por contactarnos. Te responderemos en menos de 24
                  horas.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-yellow-600 hover:text-yellow-500 font-semibold transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h3 className="text-xl font-serif font-bold text-[#1a1a2e] mb-6">
                  Envíanos un mensaje
                </h3>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Tu nombre"
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                      errors.name
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-yellow-400"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="tu@email.com"
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

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="¿En qué podemos ayudarte?"
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors resize-none ${
                      errors.message
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-yellow-400"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1a1a2e] border-t-transparent" />
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
