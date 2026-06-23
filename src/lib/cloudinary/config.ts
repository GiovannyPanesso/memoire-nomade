export interface ConfigCloudinaryCliente {
  cloudName: string;
  apiKey: string;
}

// El cloud name y la API key no son secretos: Cloudinary los expone
// intencionalmente al cliente para firmar subidas. Solo CLOUDINARY_API_SECRET
// debe permanecer en el servidor (ver src/app/api/admin/cloudinary/route.ts).
export function obtenerConfigCloudinaryCliente(): ConfigCloudinaryCliente | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    return null;
  }

  return { cloudName, apiKey };
}
