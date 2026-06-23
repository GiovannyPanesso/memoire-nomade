"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { actualizarImagenesSitio } from "@/lib/configuracion/acciones";
import type { ImagenesSitio, DatosImagenesSitioFormulario } from "@/types";

const CARPETA_CLOUDINARY = "memoire-nomade/web";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

interface CampoImagen {
  clave: keyof DatosImagenesSitioFormulario;
  titulo: string;
  descripcion: string;
}

const CAMPOS_IMAGENES: CampoImagen[] = [
  {
    clave: "logoUrl",
    titulo: "Logo del negocio",
    descripcion: "Aparece en la parte superior de todas las páginas",
  },
  {
    clave: "imagenCabecera",
    titulo: "Imagen principal de la cabecera",
    descripcion: "Imagen grande de fondo en la página de inicio",
  },
  {
    clave: "imagenSeccion1",
    titulo: "Imagen sección destacada 1",
    descripcion: "Foto de la primera sección destacada de la página de inicio",
  },
  {
    clave: "imagenSeccion2",
    titulo: "Imagen sección destacada 2",
    descripcion: "Foto de la segunda sección destacada de la página de inicio",
  },
  {
    clave: "imagenSeccion3",
    titulo: "Imagen sección destacada 3",
    descripcion: "Foto de la tercera sección destacada de la página de inicio",
  },
  {
    clave: "imagenGaleria1",
    titulo: "Foto de galería 1",
    descripcion: "Primera foto de la galería de la página de inicio",
  },
  {
    clave: "imagenGaleria2",
    titulo: "Foto de galería 2",
    descripcion: "Segunda foto de la galería de la página de inicio",
  },
  {
    clave: "imagenGaleria3",
    titulo: "Foto de galería 3",
    descripcion: "Tercera foto de la galería de la página de inicio",
  },
];

interface PropiedadesCloudinary {
  cloudName: string;
  apiKey: string;
}

type PestanaImagen = "url" | "subir";

interface PropiedadesTarjetaImagen {
  titulo: string;
  descripcion: string;
  valorOriginal: string;
  valor: string;
  alCambiar: (valor: string) => void;
  cloudinary: PropiedadesCloudinary | null;
}

function TarjetaImagen({
  titulo,
  descripcion,
  valorOriginal,
  valor,
  alCambiar,
  cloudinary,
}: PropiedadesTarjetaImagen) {
  const [pestana, setPestana] = useState<PestanaImagen>("url");
  const [errorImagenActual, setErrorImagenActual] = useState(false);
  const hayCambioPendiente = valor !== "" && valor !== valorOriginal;

  return (
    <div className="rounded-lg border border-marca-dorado/20 bg-white p-5">
      <h3 className="font-serif text-base text-marca-carbon">{titulo}</h3>
      <p className="mt-1 text-xs text-marca-gris">{descripcion}</p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <p className="text-xs font-medium text-marca-gris">Imagen actual</p>
          <div className="mt-1 h-20 w-32 overflow-hidden rounded-md border border-marca-gris/20 bg-marca-crema">
            {valorOriginal && !errorImagenActual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={valorOriginal}
                alt={titulo}
                className="h-full w-full object-cover"
                onError={() => setErrorImagenActual(true)}
                onLoad={() => setErrorImagenActual(false)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-xs text-marca-gris">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPestana("url")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                pestana === "url"
                  ? "bg-marca-dorado text-white"
                  : "border border-marca-gris/30 text-marca-gris hover:bg-marca-crema"
              }`}
            >
              URL externa
            </button>
            {cloudinary ? (
              <button
                type="button"
                onClick={() => setPestana("subir")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  pestana === "subir"
                    ? "bg-marca-dorado text-white"
                    : "border border-marca-gris/30 text-marca-gris hover:bg-marca-crema"
                }`}
              >
                Subir imagen
              </button>
            ) : null}
          </div>

          <div className="mt-3">
            {pestana === "url" ? (
              <input
                type="url"
                value={valor}
                onChange={(evento) => alCambiar(evento.target.value)}
                placeholder="https://..."
                className={ESTILOS_INPUT}
              />
            ) : cloudinary ? (
              <CldUploadWidget
                signatureEndpoint="/api/admin/cloudinary"
                config={{
                  cloud: {
                    cloudName: cloudinary.cloudName,
                    apiKey: cloudinary.apiKey,
                  },
                }}
                options={{
                  folder: CARPETA_CLOUDINARY,
                  sources: ["local"],
                  multiple: false,
                }}
                onSuccess={(resultado) => {
                  if (
                    resultado.info &&
                    typeof resultado.info === "object" &&
                    "secure_url" in resultado.info
                  ) {
                    alCambiar(resultado.info.secure_url);
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
                  >
                    Seleccionar imagen desde el dispositivo
                  </button>
                )}
              </CldUploadWidget>
            ) : null}
          </div>

          {hayCambioPendiente ? (
            <div className="mt-3">
              <p className="text-xs text-marca-gris">
                Vista previa de la nueva imagen
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={valor}
                alt={`Vista previa de ${titulo.toLowerCase()}`}
                className="mt-1 h-32 w-full max-w-xs rounded-md border border-marca-dorado object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface PropiedadesFormularioImagenesSitio {
  imagenesIniciales: ImagenesSitio;
  cloudinary: PropiedadesCloudinary | null;
}

export function FormularioImagenesSitio({
  imagenesIniciales,
  cloudinary,
}: PropiedadesFormularioImagenesSitio) {
  const router = useRouter();
  const [valores, setValores] = useState<DatosImagenesSitioFormulario>({
    logoUrl: imagenesIniciales.logoUrl ?? "",
    imagenCabecera: imagenesIniciales.imagenCabecera ?? "",
    imagenSeccion1: imagenesIniciales.imagenSeccion1 ?? "",
    imagenSeccion2: imagenesIniciales.imagenSeccion2 ?? "",
    imagenSeccion3: imagenesIniciales.imagenSeccion3 ?? "",
    imagenGaleria1: imagenesIniciales.imagenGaleria1 ?? "",
    imagenGaleria2: imagenesIniciales.imagenGaleria2 ?? "",
    imagenGaleria3: imagenesIniciales.imagenGaleria3 ?? "",
  });
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function actualizarCampo(
    clave: keyof DatosImagenesSitioFormulario,
    valor: string
  ) {
    setValores((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setGuardado(false);

    iniciarTransicion(async () => {
      try {
        await actualizarImagenesSitio(valores);
        setGuardado(true);
        router.refresh();
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudieron guardar las imágenes."
        );
      }
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {CAMPOS_IMAGENES.map((campo) => (
        <TarjetaImagen
          key={campo.clave}
          titulo={campo.titulo}
          descripcion={campo.descripcion}
          valorOriginal={imagenesIniciales[campo.clave] ?? ""}
          valor={valores[campo.clave]}
          alCambiar={(valor) => actualizarCampo(campo.clave, valor)}
          cloudinary={cloudinary}
        />
      ))}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {guardado ? (
        <p className="text-sm text-emerald-700">Cambios guardados.</p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-marca-dorado px-5 py-2.5 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
