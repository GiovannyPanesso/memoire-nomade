"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import type { DatosTourFormulario } from "@/types";

const CODIGO_INICIO_DIACRITICOS = 0x0300;
const CODIGO_FIN_DIACRITICOS = 0x036f;

function quitarDiacriticos(texto: string): string {
  return Array.from(texto.normalize("NFD"))
    .filter((caracter) => {
      const codigo = caracter.codePointAt(0) ?? 0;
      return codigo < CODIGO_INICIO_DIACRITICOS || codigo > CODIGO_FIN_DIACRITICOS;
    })
    .join("");
}

function generarSlug(texto: string): string {
  return quitarDiacriticos(texto.toLowerCase())
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CARPETA_CLOUDINARY = "memoire-nomade/tours";

const ESTILOS_INPUT =
  "w-full rounded-md border border-marca-gris/30 px-3 py-2 text-sm outline-none transition focus:border-marca-dorado focus:ring-2 focus:ring-marca-dorado/30";

interface PropiedadesListaEditable {
  etiqueta: string;
  items: string[];
  alCambiar: (items: string[]) => void;
  placeholder: string;
}

function ListaEditable({
  etiqueta,
  items,
  alCambiar,
  placeholder,
}: PropiedadesListaEditable) {
  const [valorNuevo, setValorNuevo] = useState("");

  function agregar() {
    const valor = valorNuevo.trim();
    if (!valor) return;
    alCambiar([...items, valor]);
    setValorNuevo("");
  }

  function eliminar(indice: number) {
    alCambiar(items.filter((_, i) => i !== indice));
  }

  return (
    <div>
      <label className="text-sm font-medium text-marca-carbon">
        {etiqueta}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={valorNuevo}
          onChange={(evento) => setValorNuevo(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault();
              agregar();
            }
          }}
          placeholder={placeholder}
          className={`flex-1 ${ESTILOS_INPUT}`}
        />
        <button
          type="button"
          onClick={agregar}
          className="rounded-md border border-marca-dorado px-4 py-2 text-sm font-medium text-marca-dorado-oscuro transition hover:bg-marca-dorado hover:text-white"
        >
          Añadir
        </button>
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {items.map((item, indice) => (
            <li
              key={`${item}-${indice}`}
              className="flex items-center justify-between rounded-md bg-marca-crema px-3 py-1.5 text-sm text-marca-carbon"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => eliminar(indice)}
                className="text-marca-gris transition hover:text-red-600"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

interface PropiedadesCloudinary {
  cloudName: string;
  apiKey: string;
}

type PestanaImagen = "url" | "subir";

interface PropiedadesSelectorImagen {
  imagenUrl: string;
  alCambiar: (url: string) => void;
  cloudinary: PropiedadesCloudinary | null;
}

function SelectorImagen({
  imagenUrl,
  alCambiar,
  cloudinary,
}: PropiedadesSelectorImagen) {
  const [pestana, setPestana] = useState<PestanaImagen>("url");
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <div>
      <label className="text-sm font-medium text-marca-carbon">
        Imagen del tour
      </label>

      <div className="mt-2 flex gap-2">
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
            id="imagenUrl"
            type="url"
            value={imagenUrl}
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

      {imagenUrl ? (
        <div className="mt-3">
          <p className="text-xs text-marca-gris">Vista previa</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenUrl}
            alt="Vista previa de la imagen del tour"
            className="mt-1 h-40 w-full max-w-sm rounded-md border border-marca-gris/20 object-cover"
            onError={() => setErrorImagen(true)}
            onLoad={() => setErrorImagen(false)}
          />
          {errorImagen ? (
            <p className="mt-1 text-xs text-red-600">
              No se pudo cargar la imagen desde esa URL.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface PropiedadesFormularioTour {
  tourInicial?: DatosTourFormulario;
  alGuardar: (datos: DatosTourFormulario) => Promise<{ id: string } | void>;
  textoBoton: string;
  cloudinary: PropiedadesCloudinary | null;
}

export function FormularioTour({
  tourInicial,
  alGuardar,
  textoBoton,
  cloudinary,
}: PropiedadesFormularioTour) {
  const router = useRouter();
  const [nombre, setNombre] = useState(tourInicial?.nombre ?? "");
  const [slug, setSlug] = useState(tourInicial?.slug ?? "");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(
    Boolean(tourInicial)
  );
  const [descripcion, setDescripcion] = useState(
    tourInicial?.descripcion ?? ""
  );
  const [duracion, setDuracion] = useState(tourInicial?.duracion ?? "");
  const [lugaresInteres, setLugaresInteres] = useState<string[]>(
    tourInicial?.lugaresInteres ?? []
  );
  const [incluye, setIncluye] = useState<string[]>(
    tourInicial?.incluye ?? []
  );
  const [noIncluye, setNoIncluye] = useState<string[]>(
    tourInicial?.noIncluye ?? []
  );
  const [imagenUrl, setImagenUrl] = useState(tourInicial?.imagenUrl ?? "");
  const [activo, setActivo] = useState(tourInicial?.activo ?? true);
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function manejarCambioNombre(valor: string) {
    setNombre(valor);
    if (!slugEditadoManualmente) {
      setSlug(generarSlug(valor));
    }
  }

  function manejarCambioSlug(valor: string) {
    setSlugEditadoManualmente(true);
    setSlug(valor);
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setGuardado(false);

    if (!imagenUrl) {
      setError("La imagen del tour es obligatoria.");
      return;
    }

    const datos: DatosTourFormulario = {
      nombre,
      slug,
      descripcion,
      duracion,
      lugaresInteres,
      incluye,
      noIncluye,
      imagenUrl,
      activo,
    };

    iniciarTransicion(async () => {
      try {
        const resultado = await alGuardar(datos);
        if (resultado && "id" in resultado) {
          router.push(`/admin/tours/${resultado.id}`);
        } else {
          setGuardado(true);
          router.refresh();
        }
      } catch (errorCapturado) {
        setError(
          errorCapturado instanceof Error
            ? errorCapturado.message
            : "No se pudo guardar el tour."
        );
      }
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-marca-carbon">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(evento) => manejarCambioNombre(evento.target.value)}
            className={`mt-1 ${ESTILOS_INPUT}`}
          />
        </div>
        <div>
          <label htmlFor="slug" className="text-sm font-medium text-marca-carbon">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(evento) => manejarCambioSlug(evento.target.value)}
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            title="Solo minúsculas, números y guiones"
            className={`mt-1 ${ESTILOS_INPUT}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="text-sm font-medium text-marca-carbon">
          Descripción
        </label>
        <textarea
          id="descripcion"
          required
          rows={4}
          value={descripcion}
          onChange={(evento) => setDescripcion(evento.target.value)}
          className={`mt-1 ${ESTILOS_INPUT}`}
        />
      </div>

      <div>
        <label htmlFor="duracion" className="text-sm font-medium text-marca-carbon">
          Duración
        </label>
        <input
          id="duracion"
          type="text"
          required
          placeholder="Ej: 8 horas"
          value={duracion}
          onChange={(evento) => setDuracion(evento.target.value)}
          className={`mt-1 max-w-xs ${ESTILOS_INPUT}`}
        />
      </div>

      <SelectorImagen
        imagenUrl={imagenUrl}
        alCambiar={setImagenUrl}
        cloudinary={cloudinary}
      />

      <ListaEditable
        etiqueta="Lugares de interés"
        items={lugaresInteres}
        alCambiar={setLugaresInteres}
        placeholder="Ej: Torre Eiffel"
      />
      <ListaEditable
        etiqueta="Qué incluye"
        items={incluye}
        alCambiar={setIncluye}
        placeholder="Ej: Guía en español"
      />
      <ListaEditable
        etiqueta="Qué no incluye"
        items={noIncluye}
        alCambiar={setNoIncluye}
        placeholder="Ej: Transporte"
      />

      <div className="flex items-center gap-3">
        <input
          id="activo"
          type="checkbox"
          checked={activo}
          onChange={(evento) => setActivo(evento.target.checked)}
          className="h-4 w-4 rounded border-marca-gris/30 text-marca-dorado focus:ring-marca-dorado"
        />
        <label htmlFor="activo" className="text-sm text-marca-carbon">
          Tour activo (visible en la web pública)
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {guardado ? (
        <p className="text-sm text-emerald-700">Cambios guardados.</p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-md bg-marca-dorado px-5 py-2.5 text-sm font-medium text-white transition hover:bg-marca-dorado-oscuro disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
