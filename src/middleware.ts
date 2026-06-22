import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const RUTA_LOGIN = "/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const esRutaLogin = pathname === RUTA_LOGIN;

  if (!token && !esRutaLogin) {
    const urlLogin = new URL(RUTA_LOGIN, request.url);
    return NextResponse.redirect(urlLogin);
  }

  if (token && esRutaLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const cabecerasConRuta = new Headers(request.headers);
  cabecerasConRuta.set("x-pathname", pathname);

  return NextResponse.next({ request: { headers: cabecerasConRuta } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
