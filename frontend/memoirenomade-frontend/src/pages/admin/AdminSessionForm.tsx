import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { sessionService } from "@/services/sessionService";
import { Session } from "@/types/session.types";
import { TourSummary } from "@/types/tour.types";
import { formatPrice } from "@/utils/formatters";

const pricingSchema = z.object({
  label: z.string().min(1, "La descripción es obligatoria."),
  price: z.string().min(1, "El precio es obligatorio."),
  type: z.enum(["group", "child", "extra"]),
  minPersons: z.string().optional(),
  maxPersons: z.string().optional(),
});

const sessionSchema = z.object({
  tourId: z.string().min(1, "Selecciona un tour."),
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  availableSpots: z.string().min(1, "Las plazas son obligatorias."),
  includesSeineCruise: z.boolean(),
  pricings: z.array(pricingSchema).min(1, "Añade al menos una tarifa."),
});

type SessionForm = z.infer<typeof sessionSchema>;

interface AdminSessionFormProps {
  session: Session | null;
  tours: TourSummary[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminSessionForm({
  session,
  tours,
  onSuccess,
  onCancel,
}: AdminSessionFormProps) {
  const isEditing = !!session;
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      tourId: session?.tourId?.toString() ?? "0",
      date: session?.date ?? "",
      time: session?.time?.slice(0, 5) ?? "",
      availableSpots: session?.availableSpots?.toString() ?? "8",
      includesSeineCruise: session?.includesSeineCruise ?? false,
      pricings: session?.pricings.map((p) => ({
        label: p.label,
        price: p.price.toString(),
        type: p.type as "group" | "child" | "extra",
        minPersons: p.minPersons?.toString() ?? "",
        maxPersons: p.maxPersons?.toString() ?? "",
      })) ?? [
        {
          label: "Grupo 2 adultos",
          price: "120",
          type: "group" as const,
          minPersons: "2",
          maxPersons: "2",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricings",
  });

  const watchedPricings = watch("pricings");

  const onSubmit = async (data: SessionForm) => {
    setSaving(true);
    setServerError(null);

    try {
      const payload = {
        tourId: parseInt(data.tourId),
        date: data.date,
        time: data.time + ":00",
        availableSpots: parseInt(data.availableSpots),
        includesSeineCruise: data.includesSeineCruise,
        pricings: data.pricings.map((p) => ({
          label: p.label,
          price: parseFloat(p.price),
          type: p.type,
          minPersons: p.minPersons ? parseInt(p.minPersons) : null,
          maxPersons: p.maxPersons ? parseInt(p.maxPersons) : null,
        })),
      };

      if (isEditing) {
        await sessionService.updateSession(session.id, payload);
      } else {
        await sessionService.createSession(payload);
      }
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(
        error.response?.data?.message ?? "No se pudo guardar la sesión.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            {isEditing ? "Editar sesión" : "Crear sesión"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEditing
              ? "Modifica los datos de la sesión."
              : "Configura una nueva sesión para un tour."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos básicos */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[#1a1a2e]">Información básica</h2>

          {/* Tour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour *
            </label>
            <select
              {...register("tourId")}
              disabled={isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                errors.tourId
                  ? "border-red-300"
                  : "border-gray-200 focus:border-yellow-400"
              } disabled:bg-gray-50`}
            >
              <option value={0}>Selecciona un tour...</option>
              {tours
                .filter((t) => t.isActive)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
            {errors.tourId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.tourId.message}
              </p>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                {...register("date")}
                type="date"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                  errors.date
                    ? "border-red-300"
                    : "border-gray-200 focus:border-yellow-400"
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora (CET/CEST — hora francesa) *
              </label>
              <input
                {...register("time")}
                type="time"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                  errors.time
                    ? "border-red-300"
                    : "border-gray-200 focus:border-yellow-400"
                }`}
              />
              {errors.time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Plazas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plazas disponibles *
            </label>
            <input
              {...register("availableSpots")}
              type="number"
              min={1}
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                errors.availableSpots
                  ? "border-red-300"
                  : "border-gray-200 focus:border-yellow-400"
              }`}
            />
            {errors.availableSpots && (
              <p className="text-red-500 text-xs mt-1">
                {errors.availableSpots.message}
              </p>
            )}
          </div>

          {/* Crucero */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register("includesSeineCruise")}
              type="checkbox"
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm text-gray-700">
              Incluir crucero por el Sena (+23€/persona)
            </span>
          </label>
        </div>

        {/* Tarifas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[#1a1a2e]">
              Tarifas ({fields.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  label: "",
                  price: "0",
                  type: "group",
                  minPersons: "",
                  maxPersons: "",
                })
              }
              className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-500 font-semibold"
            >
              <Plus size={16} />
              Añadir tarifa
            </button>
          </div>

          {errors.pricings?.root && (
            <p className="text-red-500 text-xs">
              {errors.pricings.root.message}
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border-2 border-gray-100 rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">
                    Tarifa {index + 1}
                    {parseFloat(watchedPricings[index]?.price) > 0 && (
                      <span className="text-yellow-600 ml-2">
                        {formatPrice(parseFloat(watchedPricings[index].price))}
                      </span>
                    )}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <input
                      {...register(`pricings.${index}.label`)}
                      placeholder="Ej: Grupo 2 adultos"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    />
                    {errors.pricings?.[index]?.label && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pricings[index]?.label?.message}
                      </p>
                    )}
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Precio (€)
                    </label>
                    <input
                      {...register(`pricings.${index}.price`)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Tipo
                    </label>
                    <select
                      {...register(`pricings.${index}.type`)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    >
                      <option value="group">Grupo adultos</option>
                      <option value="child">Infantil</option>
                      <option value="extra">Extra</option>
                    </select>
                  </div>

                  {/* Min / Max personas */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Mín. personas
                    </label>
                    <input
                      {...register(`pricings.${index}.minPersons`)}
                      type="number"
                      min="1"
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Máx. personas
                    </label>
                    <input
                      {...register(`pricings.${index}.maxPersons`)}
                      type="number"
                      min="1"
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1a1a2e] border-t-transparent" />
            )}
            {isEditing ? "Guardar cambios" : "Crear sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
