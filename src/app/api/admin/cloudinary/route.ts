import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { opcionesAuth } from "@/lib/auth/opciones-auth";

const esquemaCuerpo = z.object({
  paramsToSign: z.record(z.union([z.string(), z.number()])),
});

function generarFirmaCloudinary(
  parametros: Record<string, string | number>,
  apiSecret: string
): string {
  const cadenaAFirmar = Object.keys(parametros)
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join("&");

  return createHash("sha1")
    .update(cadenaAFirmar + apiSecret)
    .digest("hex");
}

export async function POST(request: Request) {
  const sesion = await getServerSession(opcionesAuth);

  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const cuerpoCrudo = await request.json();
  const resultado = esquemaCuerpo.safeParse(cuerpoCrudo);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Faltan parámetros para firmar la subida." },
      { status: 400 }
    );
  }

  const signature = generarFirmaCloudinary(
    resultado.data.paramsToSign,
    apiSecret
  );

  return NextResponse.json({ signature });
}
