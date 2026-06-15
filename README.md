# Mémoire Nomade 🗼

> Full-stack web application for booking guided tours in Paris.

## 🌍 Language

[🇬🇧 English](#-english) | [🇪🇸 Español](#-español)

---

# 🇬🇧 English

## Overview

**Mémoire Nomade** is a full-stack web application that allows customers to explore, book, and manage guided tours in Paris. It includes a complete public-facing website and a private admin panel.

### Live Demo

> 🚧 Coming soon — deployment in progress.

---

## ✨ Features

### Public Website

- 🗺️ Browse available tours with gallery and details
- 📅 View available sessions with pricing
- 🛒 Cart system with multi-tour booking
- 💳 Secure payment with Stripe
- 📧 Contact form
- ✅ Booking confirmation with unique MN code

### Admin Panel

- 📊 Dashboard with key metrics
- 🗺️ Full tour management (CRUD + featured + images)
- 📅 Session management with pricing tiers
- 📋 Booking management with status history
- 💰 Real Stripe refunds
- 💬 Customer messages inbox
- 👥 Admin user management

---

## 🛠️ Tech Stack

### Backend

| Technology              | Purpose            |
| ----------------------- | ------------------ |
| ASP.NET Core 8          | REST API           |
| Entity Framework Core 8 | ORM / Code First   |
| SQL Server              | Database           |
| JWT + Refresh Tokens    | Authentication     |
| Stripe.net              | Payments & Refunds |
| Serilog                 | Logging            |
| Swagger / OpenAPI       | API Documentation  |

### Frontend

| Technology               | Purpose            |
| ------------------------ | ------------------ |
| React 18 + TypeScript    | UI Framework       |
| Vite                     | Build Tool         |
| Tailwind CSS v4          | Styling            |
| React Router v6          | Routing            |
| Zustand                  | State Management   |
| React Hook Form + Zod    | Forms & Validation |
| Axios                    | HTTP Client        |
| Stripe.js + React Stripe | Payment UI         |
| Lucide React             | Icons              |

---

## 🏗️ Project Structure

```
memoire-nomade/
├── backend/
│   └── MemoireNomade.API/
│       ├── Controllers/
│       │   ├── Admin/          # Protected admin endpoints
│       │   ├── AuthController
│       │   ├── BookingsController
│       │   ├── ContactController
│       │   ├── PaymentController
│       │   ├── SessionsController
│       │   └── ToursController
│       ├── Data/               # DbContext + Factory
│       ├── DTOs/               # Data Transfer Objects
│       ├── Middleware/         # Custom middleware
│       ├── Migrations/         # EF Core migrations
│       ├── Models/             # Domain models
│       ├── Services/           # Business logic
│       └── Program.cs
│
└── frontend/
    └── memoirenomade-frontend/
        └── src/
            ├── components/     # Reusable UI components
            ├── pages/
            │   ├── admin/      # Admin panel pages
            │   └── (public)    # Public website pages
            ├── services/       # API + Stripe services
            ├── store/          # Zustand stores
            ├── types/          # TypeScript interfaces
            └── utils/          # Formatters & helpers
```

---

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- SQL Server
- Stripe account (for payments)

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/GiovannyPanesso/memoire-nomade.git
cd memoire-nomade/backend/MemoireNomade.API
```

**2. Configure settings**

Copy the example config file:

```bash
cp appsettings.Development.example.json appsettings.Development.json
```

Update `appsettings.Development.json` with your values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=MemoireNomadeDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-min-32-chars",
    "Issuer": "MemoireNomade.API",
    "Audience": "MemoireNomade.Frontend",
    "ExpirationHours": 8
  },
  "RefreshTokenSettings": {
    "ExpirationDays": 30
  },
  "Stripe": {
    "SecretKey": "sk_test_YOUR_KEY",
    "PublishableKey": "pk_test_YOUR_KEY",
    "WebhookSecret": "whsec_YOUR_SECRET"
  }
}
```

**3. Run migrations**

```bash
dotnet ef database update
```

**4. Start the API**

```bash
dotnet run
```

Swagger available at: `http://localhost:5200/swagger`

Default admin credentials (seeded):

- Email: `admin@memoirenomade.com`
- Password: `Admin1234`

---

### Frontend Setup

**1. Navigate to frontend**

```bash
cd memoire-nomade/frontend/memoirenomade-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment**

Create `.env` in the frontend root:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

**4. Start dev server**

```bash
npm run dev
```

App available at: `http://localhost:5173`

---

### Stripe Webhooks (Local Development)

Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to http://localhost:5200/api/payments/webhook
```

Copy the `whsec_` secret to your `appsettings.Development.json`.

---

## 📡 API Endpoints

### Authentication

```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Public

```
GET  /api/tours
GET  /api/tours/featured
GET  /api/tours/{id}
GET  /api/tours/{id}/sessions
POST /api/bookings
GET  /api/bookings/{confirmationCode}
POST /api/contact
```

### Admin (JWT required)

```
GET    /api/admin/dashboard
GET    /api/admin/tours
POST   /api/admin/tours
PUT    /api/admin/tours/{id}
DELETE /api/admin/tours/{id}
GET    /api/admin/sessions
POST   /api/admin/sessions
PUT    /api/admin/sessions/{id}
DELETE /api/admin/sessions/{id}
GET    /api/admin/bookings
GET    /api/admin/bookings/{id}
PUT    /api/admin/bookings/{id}
POST   /api/admin/bookings/{id}/refund
GET    /api/admin/messages
PUT    /api/admin/messages/{id}/read
DELETE /api/admin/messages/{id}
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
PUT    /api/admin/users/me/credentials
```

### Payments

```
POST /api/payments/create-payment-intent
POST /api/payments/webhook
```

---

## 🔐 Security

- JWT access tokens (8h expiry)
- HTTP-only cookies for refresh tokens (30d)
- Refresh token rotation on each use
- CORS restricted to frontend origin
- Passwords hashed with ASP.NET Identity PasswordHasher
- Stripe webhook signature verification

---

## 📋 Development Phases

- [x] Phase 1 — Backend base (models, EF Core, migrations, auth)
- [x] Phase 2 — Backend features (tours, sessions, bookings, contact, dashboard)
- [x] Phase 3 — Frontend public website
- [x] Phase 4 — Admin panel
- [x] Phase 5 — Stripe payments & refunds
- [x] Phase 6 — SendGrid email notifications
- [x] Phase 7 — Deployment

---

## 👨‍💻 Author

**Giovanny Panesso**

Full-stack development project built to practice and demonstrate skills in:

- .NET 8 / ASP.NET Core
- React + TypeScript
- SQL Server / Entity Framework Core
- Stripe payment integration
- JWT authentication systems
- REST API design

---

# 🇪🇸 Español

## Descripción

**Mémoire Nomade** es una aplicación web full stack para la gestión y reserva de tours turísticos en París. Incluye un sitio web público y un panel de administración privado.

---

## ✨ Funcionalidades

### Sitio Web Público

- 🗺️ Explorar tours disponibles con galería y detalles
- 📅 Consultar sesiones disponibles con tarifas
- 🛒 Carrito con reserva de múltiples tours
- 💳 Pago seguro con Stripe
- 📧 Formulario de contacto
- ✅ Confirmación de reserva con código MN único

### Panel de Administración

- 📊 Dashboard con métricas clave
- 🗺️ Gestión completa de tours (CRUD + destacados + imágenes)
- 📅 Gestión de sesiones con tarifas múltiples
- 📋 Gestión de reservas con historial de estados
- 💰 Reembolsos reales con Stripe
- 💬 Bandeja de mensajes de clientes
- 👥 Gestión de usuarios administradores

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología              | Uso                |
| ----------------------- | ------------------ |
| ASP.NET Core 8          | REST API           |
| Entity Framework Core 8 | ORM / Code First   |
| SQL Server              | Base de datos      |
| JWT + Refresh Tokens    | Autenticación      |
| Stripe.net              | Pagos y reembolsos |
| Serilog                 | Logging            |
| Swagger / OpenAPI       | Documentación API  |

### Frontend

| Tecnología               | Uso                      |
| ------------------------ | ------------------------ |
| React 18 + TypeScript    | Framework UI             |
| Vite                     | Herramienta de build     |
| Tailwind CSS v4          | Estilos                  |
| React Router v6          | Enrutamiento             |
| Zustand                  | Estado global            |
| React Hook Form + Zod    | Formularios y validación |
| Axios                    | Cliente HTTP             |
| Stripe.js + React Stripe | UI de pagos              |
| Lucide React             | Iconos                   |

---

## 🚀 Instalación

### Requisitos previos

- .NET 8 SDK
- Node.js 18+
- SQL Server
- Cuenta de Stripe (para pagos)

### Backend

```bash
git clone https://github.com/GiovannyPanesso/memoire-nomade.git
cd memoire-nomade/backend/MemoireNomade.API
cp appsettings.Development.example.json appsettings.Development.json
# Editar appsettings.Development.json con tus valores
dotnet ef database update
dotnet run
```

Swagger disponible en: `http://localhost:5200/swagger`

Credenciales admin por defecto:

- Email: `admin@memoirenomade.com`
- Contraseña: `Admin1234`

### Frontend

```bash
cd memoire-nomade/frontend/memoirenomade-frontend
npm install
# Crear .env con VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
npm run dev
```

App disponible en: `http://localhost:5173`

---

## 📋 Fases de desarrollo

- [x] Fase 1 — Base del backend (modelos, EF Core, migraciones, auth)
- [x] Fase 2 — Funcionalidades backend (tours, sesiones, reservas, contacto, dashboard)
- [x] Fase 3 — Frontend sitio web público
- [x] Fase 4 — Panel de administración
- [x] Fase 5 — Pagos y reembolsos con Stripe
- [x] Fase 6 — Notificaciones por email con SendGrid
- [x] Fase 7 — Despliegue

---

## 👨‍💻 Autor

**Giovanny Panesso**

Proyecto de desarrollo full stack creado para practicar y demostrar habilidades en:

- .NET 8 / ASP.NET Core
- React + TypeScript
- SQL Server / Entity Framework Core
- Integración de pagos con Stripe
- Sistemas de autenticación JWT
- Diseño de APIs REST
