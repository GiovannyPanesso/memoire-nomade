# Mémoire Nomade — Guía para Claude

## Contexto del proyecto

Plataforma de venta de tours turísticos en París, guiados en español.
Negocio real en producción. Cada decisión técnica tiene impacto directo.

## Stack

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript estricto (`strict: true`)
- **Estilos**: Tailwind CSS + shadcn/ui
- **ORM**: Prisma con PostgreSQL (Supabase)
- **Pagos**: Stripe (pago completo al reservar)
- **Emails**: Resend con plantillas HTML
- **Auth**: NextAuth.js (solo admins)
- **Deploy**: Vercel

## Convenciones de código

### Idioma
- **Todo el código, comentarios y nombres** están en **español**
- Excepciones técnicas: nombres de librerías, props de HTML/JSX estándar, SQL

### Nomenclatura
- Componentes React: `PascalCase` → `TarjetaTour.tsx`
- Funciones y variables: `camelCase` → `calcularPrecioTotal()`
- Archivos: `kebab-case` → `calculadora-precio.ts`
- Constantes globales: `SCREAMING_SNAKE_CASE` → `PRECIO_BASE_NINO`
- Tipos e interfaces: `PascalCase` → `interface DatosTour`

### Estructura de carpetas

```
src/
├── app/                        # Rutas Next.js App Router
│   ├── (publico)/              # Grupo: web pública (sin layout admin)
│   │   ├── page.tsx            # Inicio
│   │   ├── tours/
│   │   ├── reserva/
│   │   └── politicas/
│   ├── admin/                  # Panel de administración
│   │   ├── layout.tsx          # Layout protegido con NextAuth
│   │   ├── page.tsx            # Dashboard
│   │   ├── reservas/
│   │   ├── tours/
│   │   ├── disponibilidad/
│   │   └── configuracion/
│   └── api/                    # API Routes
│       ├── auth/               # NextAuth handlers
│       ├── webhooks/stripe/    # Webhook de Stripe
│       ├── tours/
│       ├── reservas/
│       └── disponibilidad/
├── components/
│   ├── ui/                     # shadcn/ui (no modificar directamente)
│   ├── tours/                  # Componentes de tours
│   ├── reservas/               # Componentes de reservas
│   ├── admin/                  # Componentes del panel admin
│   └── layout/                 # Header, Footer, Nav
├── lib/
│   ├── prisma/                 # Cliente Prisma singleton
│   ├── stripe/                 # Lógica de Stripe
│   ├── emails/                 # Lógica de Resend + plantillas
│   ├── auth/                   # Configuración NextAuth
│   ├── reservas/               # Lógica de negocio de reservas
│   └── tours/                  # Lógica de negocio de tours
├── hooks/                      # React hooks personalizados
└── types/                      # Tipos TypeScript compartidos
```

### TypeScript

- Siempre `strict: true`
- Nunca usar `any` — usar `unknown` y type guards si se necesita
- Inferir tipos cuando sea obvio; anotar explícitamente en APIs públicas
- Preferir `interface` sobre `type` para objetos; `type` para uniones/intersecciones
- Exportar tipos desde `src/types/index.ts`

### Seguridad

- **Nunca** hardcodear claves, contraseñas ni tokens en el código
- Todas las claves externas van en variables de entorno (`.env.local`)
- Validar **siempre** con Zod en los endpoints de la API
- Sanitizar inputs antes de pasarlos a Prisma
- Las rutas `/admin/*` requieren sesión válida de NextAuth
- El webhook de Stripe debe verificar la firma antes de procesar
- Usar `bcryptjs` con 12 rondas para contraseñas de admins

### API Routes

- Validar el cuerpo de la petición con un schema Zod
- Retornar siempre `{ error: string }` en caso de fallo
- Retornar siempre `{ data: T }` en caso de éxito
- Usar códigos HTTP correctos (400 validación, 401 no auth, 404 no encontrado, 500 error servidor)
- Capturar y loggear errores antes de responder con 500

### Base de datos

- **Nunca** hacer queries crudas a la DB desde componentes o páginas
- Toda la lógica de DB va en `src/lib/` (patrón repositorio)
- Usar transacciones Prisma cuando se modifiquen múltiples tablas
- Paginación en todas las listas del admin

### Componentes

- Componentes de servidor por defecto; `"use client"` solo cuando se necesita interactividad
- Props tipadas con `interface` en el mismo archivo
- No pasar datos sensibles (como hashes de contraseña) a componentes cliente

### Estilos

- Tailwind utilitarios directamente en JSX
- Para variantes complejas usar `cva` (class-variance-authority)
- No escribir CSS custom salvo casos extremos
- Paleta de colores y tipografía definidas en `tailwind.config.ts`

## Flujo de pago (nunca alterar sin revisar implicaciones)

1. Cliente envía formulario → se crea `PaymentIntent` en Stripe
2. Cliente paga con Stripe Elements
3. Stripe llama al webhook → se verifica firma
4. Webhook crea la `Reserva` con estado `CONFIRMADA`
5. Webhook dispara emails via Resend

**No crear la reserva antes de confirmar el pago.**

## Políticas de cancelación (lógica de negocio crítica)

| Antelación       | Reembolso |
|------------------|-----------|
| > 30 días        | 70%       |
| 20–30 días       | 50%       |
| < 15 días        | 0%        |
| No show          | 0%        |
| Cancelación empresa | 100%   |

Esta lógica vive en `src/lib/reservas/politicas-cancelacion.ts`.

## Qué NO hacer

- No mezclar lógica de negocio dentro de componentes o páginas
- No usar `console.log` en producción (usar un logger estructurado)
- No mutar el estado de Prisma desde el cliente
- No exponer el `stripePaymentIntentId` ni datos internos en respuestas públicas
- No procesar el webhook de Stripe sin verificar la firma
- No omitir validación Zod en ningún endpoint
