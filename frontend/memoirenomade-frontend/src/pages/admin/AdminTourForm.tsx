import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Plus } from "lucide-react";
import { tourService } from "@/services/tourService";

const tourSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  description: z.string().min(10, "La descripción es obligatoria."),
  includes: z.string().optional(),
  notIncludes: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  mainImageUrl: z
    .string()
    .url("Debe ser una URL válida.")
    .optional()
    .or(z.literal("")),
});

type TourForm = z.infer<typeof tourSchema>;

export default function AdminTourForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TourForm>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (isEditing) {
      tourService
        .getTourById(parseInt(id!))
        .then((tour) => {
          reset({
            name: tour.name,
            description: tour.description,
            includes: tour.includes ?? "",
            notIncludes: tour.notIncludes ?? "",
            isActive: tour.isActive,
            isFeatured: tour.isFeatured,
            mainImageUrl: tour.mainImageUrl ?? "",
          });
          setGalleryUrls(tour.images.map((i) => i.imageUrl));
          setLoading(false);
        })
        .catch(() => navigate("/admin/tours"));
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = async (data: TourForm) => {
    setSaving(true);
    setServerError(null);

    try {
      if (isEditing) {
        await tourService.updateTour(parseInt(id!), data);
      } else {
        await tourService.createTour(data);
      }
      navigate("/admin/tours");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error completo:", err);
      console.error("Response data:", error.response?.data);
      setServerError(
        error.response?.data?.message ?? "No se pudo guardar el tour.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl || !id) return;
    try {
      await tourService.addImage(parseInt(id), newImageUrl, galleryUrls.length);
      setGalleryUrls((prev) => [...prev, newImageUrl]);
      setNewImageUrl("");
    } catch {
      setServerError("No se pudo añadir la imagen.");
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
    <div className="max-w-3xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/tours")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            {isEditing ? "Editar tour" : "Crear tour"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEditing
              ? "Modifica los datos del tour."
              : "Completa el formulario para crear un nuevo tour."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos básicos */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[#1a1a2e]">Información básica</h2>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del tour *
            </label>
            <input
              {...register("name")}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                errors.name
                  ? "border-red-300"
                  : "border-gray-200 focus:border-yellow-400"
              }`}
              placeholder="Ej: Tour Montmartre al Atardecer"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              {...register("description")}
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors resize-none ${
                errors.description
                  ? "border-red-300"
                  : "border-gray-200 focus:border-yellow-400"
              }`}
              placeholder="Describe la experiencia del tour..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Incluye / No incluye */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué incluye?
              </label>
              <textarea
                {...register("includes")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors resize-none"
                placeholder="Ej: Guía nativo, entrada al museo, degustación..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Separa los ítems con comas.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué NO incluye?
              </label>
              <textarea
                {...register("notIncludes")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors resize-none"
                placeholder="Ej: Transporte, comidas adicionales..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Separa los ítems con comas.
              </p>
            </div>
          </div>
        </div>

        {/* Imagen principal */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-[#1a1a2e]">Imagen principal</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen principal
            </label>
            <input
              {...register("mainImageUrl")}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                errors.mainImageUrl
                  ? "border-red-300"
                  : "border-gray-200 focus:border-yellow-400"
              }`}
              placeholder="https://images.unsplash.com/..."
            />
            {errors.mainImageUrl && (
              <p className="text-red-500 text-xs mt-1">
                {errors.mainImageUrl.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Formato 16:9, mínimo 1280×720px, máximo 2MB. JPG/PNG/WebP.
            </p>
          </div>
        </div>

        {/* Galería — solo en edición */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-[#1a1a2e]">
              Galería ({galleryUrls.length}/10)
            </h2>

            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {galleryUrls.length < 10 && (
              <div className="flex gap-2">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none transition-colors text-sm"
                  placeholder="URL de la imagen..."
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl}
                  className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <Plus size={16} />
                  Añadir
                </button>
              </div>
            )}
          </div>
        )}

        {/* Estado */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-[#1a1a2e]">Configuración</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register("isActive")}
              type="checkbox"
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm text-gray-700">
              Tour activo (visible para clientes)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register("isFeatured")}
              type="checkbox"
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm text-gray-700">
              Destacado en la página principal (máximo 3)
            </span>
          </label>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{serverError}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/tours")}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1a1a2e] border-t-transparent" />
            ) : null}
            {isEditing ? "Guardar cambios" : "Crear tour"}
          </button>
        </div>
      </form>
    </div>
  );
}
