"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarAdmin } from "@/lib/configuracion/acciones";
import { FormularioConfiguracion } from "@/components/admin/formulario-configuracion";
import { FormularioNuevoAdmin } from "@/components/admin/formulario-nuevo-admin";
import { FormularioCambiarPassword } from "@/components/admin/formulario-cambiar-password";
import { FormularioImagenesSitio } from "@/components/admin/formulario-imagenes-sitio";
import type { ConfiguracionNegocio, AdminListado, ImagenesSitio } from "@/types";

type Pestana = "negocio" | "administradores" | "imagenes";

interface PropiedadesCloudinary {
  cloudName: string;
  apiKey: string;
}

interface PropiedadesPestanasConfiguracion {
  configuracionInicial: ConfiguracionNegocio;
  admins: AdminListado[];
  imagenesIniciales: ImagenesSitio;
  cloudinary: PropiedadesCloudinary | null;
}

export function PestanasConfiguracion({
  configuracionInicial,
  admins,
  imagenesIniciales,
  cloudinary,
}: PropiedadesPestanasConfiguracion) {
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>("negocio");
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function manejarEliminarAdmin(id: string, nombre: string) {
    const confirmado = window.confirm(
      `¿Eliminar al administrador "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setError(null);
    iniciarTransicion(async () => {
      try {
        await eliminarAdmin(id);
        router.refresh();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo eliminar el administrador."
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-marca-dorado/20">
        <button
          type="button"
          onClick={() => setPestana("negocio")}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            pestana === "negocio"
              ? "border-b-2 border-marca-dorado text-marca-dorado-oscuro"
              : "text-marca-gris hover:text-marca-carbon"
          }`}
        >
          Datos del negocio
        </button>
        <button
          type="button"
          onClick={() => setPestana("administradores")}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            pestana === "administradores"
              ? "border-b-2 border-marca-dorado text-marca-dorado-oscuro"
              : "text-marca-gris hover:text-marca-carbon"
          }`}
        >
          Administradores
        </button>
        <button
          type="button"
          onClick={() => setPestana("imagenes")}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            pestana === "imagenes"
              ? "border-b-2 border-marca-dorado text-marca-dorado-oscuro"
              : "text-marca-gris hover:text-marca-carbon"
          }`}
        >
          Imágenes del sitio
        </button>
      </div>

      {pestana === "negocio" ? (
        <section className="max-w-xl rounded-lg border border-marca-dorado/20 bg-white p-6">
          <FormularioConfiguracion configuracionInicial={configuracionInicial} />
        </section>
      ) : null}

      {pestana === "imagenes" ? (
        <div className="max-w-3xl space-y-4">
          <p className="text-sm text-marca-gris">
            Estas son las fotos que ven los visitantes en la web pública.
            Pega un enlace o sube una imagen desde tu dispositivo, revisa la
            vista previa y guarda los cambios al final.
          </p>
          <FormularioImagenesSitio
            imagenesIniciales={imagenesIniciales}
            cloudinary={cloudinary}
          />
        </div>
      ) : null}

      {pestana === "administradores" ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
            <h2 className="font-serif text-lg text-marca-carbon">
              Administradores actuales
            </h2>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <ul className="mt-4 divide-y divide-marca-dorado/10">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-marca-carbon">
                      {admin.nombre}
                    </p>
                    <p className="text-xs text-marca-gris">{admin.email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={pendiente || admins.length <= 1}
                    onClick={() => manejarEliminarAdmin(admin.id, admin.nombre)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            {admins.length <= 1 ? (
              <p className="mt-3 text-xs text-marca-gris">
                Debe quedar al menos un administrador.
              </p>
            ) : null}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
              <h2 className="font-serif text-lg text-marca-carbon">
                Nuevo administrador
              </h2>
              <div className="mt-4">
                <FormularioNuevoAdmin />
              </div>
            </section>

            <section className="rounded-lg border border-marca-dorado/20 bg-white p-6">
              <h2 className="font-serif text-lg text-marca-carbon">
                Cambiar mi contraseña
              </h2>
              <div className="mt-4">
                <FormularioCambiarPassword />
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
