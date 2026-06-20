# Mémoire Nomade

Plataforma de reservas para tours turísticos en París guiados en español. Los clientes pueden explorar los tours disponibles, calcular el precio según el tamaño de su grupo y opcionales, y pagar directamente con tarjeta a través de Stripe.

## Stack técnico

- **Next.js 14** (App Router) + **TypeScript** estricto
- **Tailwind CSS** + **shadcn/ui**
- **Prisma ORM** con **PostgreSQL** en Supabase
- **Stripe** para pagos (pago completo al reservar)
- **Resend** para emails transaccionales
- **NextAuth.js** para autenticación del panel admin
- **Vercel** para el deploy

---

## Configurar el entorno local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/memoire-nomade.git
cd memoire-nomade
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y completa cada variable (ver guías de configuración abajo).

### 3. Generar el cliente de Prisma

```bash
npm run db:generate
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **Settings → Database**
3. Copia la **Connection string** en modo `Transaction` (puerto 6543) → `DATABASE_URL`
4. Copia la **Connection string** en modo `Session` (puerto 5432) → `DIRECT_URL`
5. En ambas URLs reemplaza `[YOUR-PASSWORD]` por la contraseña del proyecto

> El `DATABASE_URL` usa pgBouncer (pooling) para producción. El `DIRECT_URL` es necesario para que `prisma migrate` funcione correctamente.

---

## Configurar Stripe

### Claves de API

1. Entra a [dashboard.stripe.com](https://dashboard.stripe.com)
2. En modo **Test**, ve a **Developers → API keys**
3. Copia la **Secret key** → `STRIPE_SECRET_KEY`
4. Copia la **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Webhook local (desarrollo)

Instala la CLI de Stripe:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (con scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

Autentícate y escucha eventos:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copia el **webhook signing secret** que aparece en consola → `STRIPE_WEBHOOK_SECRET`

### Webhook en producción

1. En el Dashboard de Stripe ve a **Developers → Webhooks → Add endpoint**
2. URL: `https://tu-dominio.com/api/webhooks/stripe`
3. Eventos a escuchar: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET` en Vercel

---

## Configurar Resend

1. Crea una cuenta en [resend.com](https://resend.com)
2. Ve a **API Keys** y genera una nueva clave → `RESEND_API_KEY`
3. Ve a **Domains** y añade tu dominio (ej. `memoirenomade.com`)
4. Añade los registros DNS que indica Resend (SPF, DKIM, DMARC)
5. Una vez verificado, configura `RESEND_FROM_EMAIL` con un email de ese dominio

> En desarrollo puedes enviar a tu propio email sin verificar dominio usando `onboarding@resend.dev` como remitente.

---

## Primer deploy en Vercel

### 1. Preparar el repositorio

Asegúrate de que el proyecto esté en GitHub y que `.env.local` esté en `.gitignore`.

### 2. Conectar con Vercel

1. Entra a [vercel.com](https://vercel.com) y haz clic en **Add New Project**
2. Importa el repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Next.js

### 3. Variables de entorno en Vercel

En la configuración del proyecto en Vercel, ve a **Settings → Environment Variables** y añade todas las variables del `.env.example` con sus valores de producción:

- Usa las claves **Live** de Stripe (no Test)
- Usa la URL de producción en `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL`
- Genera un nuevo `NEXTAUTH_SECRET` con `openssl rand -base64 32`

### 4. Ejecutar migraciones en producción

Después del primer deploy, ejecuta las migraciones desde tu máquina apuntando a la DB de producción:

```bash
# Temporalmente en tu .env.local, usa las URLs de producción de Supabase
npm run db:migrate:prod
```

### 5. Crear el primer admin

Conecta a la base de datos de producción (via Supabase Studio o psql) y ejecuta:

```sql
INSERT INTO admins (id, email, nombre, "passwordHash", "creadoEn")
VALUES (
  gen_random_uuid(),
  'tu@email.com',
  'Tu Nombre',
  -- Hash generado con bcryptjs (12 rondas) de la contraseña deseada
  '$2b$12$...',
  NOW()
);
```

O usa el script de seed: `npm run db:seed` (configura las credenciales primero en `prisma/seed.ts`).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:migrate` | Crear y aplicar nueva migración |
| `npm run db:migrate:prod` | Aplicar migraciones en producción |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Poblar la DB con datos iniciales |

---

## Estructura del proyecto

```
src/
├── app/                   # Rutas (Next.js App Router)
│   ├── (publico)/         # Web pública
│   ├── admin/             # Panel de administración
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/                # shadcn/ui
│   ├── tours/
│   ├── reservas/
│   ├── admin/
│   └── layout/
├── lib/                   # Lógica de negocio
│   ├── prisma/
│   ├── stripe/
│   ├── emails/
│   ├── auth/
│   ├── reservas/
│   └── tours/
├── hooks/                 # React hooks
└── types/                 # Tipos TypeScript
prisma/
├── schema.prisma          # Modelos de base de datos
└── seed.ts                # Datos iniciales
```

---

## Licencia

Proyecto privado — todos los derechos reservados.
