# Mémoire Nomade API

## 🌍 Language

[🇬🇧 English](#-english) | [🇪🇸 Español](#-español)

Backend API for **Mémoire Nomade**, a web platform for booking guided tours in Paris.

The application allows customers to explore tours, view available sessions, make reservations, and manage bookings through a secure API.

This repository currently contains the **ASP.NET Core 8 Web API backend** of the platform.

---

# 🇬🇧 English

## Overview

Mémoire Nomade is a **full-stack web application** designed to manage and book guided tours in Paris.

The platform allows customers to:

- Explore available tours
- View available sessions
- Book tours online
- Contact the tour provider
- Manage reservations

Administrators can:

- Manage tours and sessions
- Manage reservations
- Access dashboard metrics
- Manage admin users
- Review customer messages

This repository contains the **backend API built with ASP.NET Core 8**.

---

## Tech Stack

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core 8 (Code First)
- SQL Server
- JWT Authentication
- Refresh Token system
- Swagger / OpenAPI
- Serilog logging

### Planned Integrations

- Stripe Payments
- PayPal Payments
- SendGrid Email service
- React + TypeScript frontend

---

## Current Development Phase

### Phase 1 — Backend Base

Implemented:

- ASP.NET Core Web API project
- Entity Framework Core configuration
- Initial domain models
- Database context (DbContext)
- Initial database migrations
- Swagger API documentation

---

### Phase 2 — Core Backend Features

Implemented features:

#### Tours

- Public tours endpoints
- Admin CRUD operations for tours
- Tour images support
- Featured tours management

#### Sessions

- Public sessions endpoints
- Admin CRUD for sessions
- Session status management
- Session pricing

#### Reservations

- Public reservation creation
- Admin reservation management
- Unique booking code generation (MN code)
- Reservation history

#### Contact System

- Public contact form
- Admin message management

#### Admin Dashboard

- Dashboard metrics for reservations and activity

#### Admin Users

- CRUD management for admin users
- Custom admin credentials

#### Authentication

- JWT authentication
- Refresh token system

---

## Phase 3 — Planned Features

Future improvements include:

### Payments

- Stripe integration
- PayPal integration

### Email Notifications

- Booking confirmation emails
- SendGrid integration

### Frontend

- React + TypeScript frontend
- Admin dashboard interface

---

## Authentication

The API uses **JWT authentication**.

Protected endpoints require a valid access token in the request header.

Example:

```
Authorization: Bearer {access_token}
```

The system also supports **refresh tokens** to renew expired access tokens.

---

## API Endpoints

Below are some of the main endpoints exposed by the API.

### Authentication

```
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

### Tours

```
GET    /api/tours
GET    /api/tours/{id}
POST   /api/admin/tours
PUT    /api/admin/tours/{id}
DELETE /api/admin/tours/{id}
```

### Sessions

```
GET    /api/sessions
GET    /api/sessions/{id}
POST   /api/admin/sessions
PUT    /api/admin/sessions/{id}
DELETE /api/admin/sessions/{id}
```

### Reservations

```
POST   /api/reservations
GET    /api/admin/reservations
GET    /api/admin/reservations/{id}
PUT    /api/admin/reservations/{id}
DELETE /api/admin/reservations/{id}
```

### Contact

```
POST /api/contact
GET  /api/admin/messages
```

### Admin Dashboard

```
GET /api/admin/dashboard/metrics
```

Full API documentation is available via **Swagger** when running the project locally.

---

## Project Structure

```
backend/MemoireNomade.API

Controllers/
Data/
DTOs/
Migrations/
Models/
Services/
Middleware/

Program.cs
appsettings.json
```

---

## Running the Project

### 1 Clone the repository

```
git clone https://github.com/GiovannyPanesso/memoire-nomade.git
```

### 2 Configure the database

Copy the configuration template:

```
appsettings.Development.example.json
```

Rename it to:

```
appsettings.Development.json
```

Then update the SQL Server connection string.

Example:

```
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=MemoireNomadeDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 3 Run database migrations

```
dotnet ef database update
```

### 4 Run the API

```
dotnet run
```

Swagger documentation will be available at:

```
https://localhost:5001/swagger
```

---

# 🇪🇸 Español

## Descripción

Mémoire Nomade es una **aplicación web full stack** diseñada para la gestión y reserva de tours turísticos en París.

La plataforma permite a los clientes:

- Explorar tours disponibles
- Consultar sesiones disponibles
- Realizar reservas online
- Contactar con el proveedor de tours
- Gestionar sus reservas

Los administradores pueden:

- Gestionar tours y sesiones
- Gestionar reservas
- Consultar métricas en el dashboard
- Gestionar usuarios administradores
- Revisar mensajes de clientes

Este repositorio contiene el **backend desarrollado con ASP.NET Core 8 Web API**.

---

## Stack tecnológico

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core 8 (Code First)
- SQL Server
- Autenticación JWT
- Sistema de Refresh Tokens
- Swagger / OpenAPI
- Logging con Serilog

### Integraciones previstas

- Stripe
- PayPal
- SendGrid
- Frontend con React + TypeScript

---

## Estado actual del proyecto

### Fase 1 — Base del Backend

Implementado:

- Proyecto ASP.NET Core Web API
- Configuración de Entity Framework Core
- Modelos iniciales del dominio
- DbContext
- Migraciones iniciales de base de datos
- Documentación de la API con Swagger

---

### Fase 2 — Funcionalidades principales del backend

Funcionalidades implementadas:

#### Tours

- Endpoints públicos de tours
- CRUD de tours para administradores
- Gestión de imágenes de tours
- Tours destacados

#### Sesiones

- Endpoints públicos de sesiones
- CRUD de sesiones para administradores
- Gestión del estado de las sesiones
- Gestión de precios

#### Reservas

- Creación pública de reservas
- Gestión de reservas para administradores
- Generación de código único de reserva (MN code)
- Historial de reservas

#### Sistema de contacto

- Formulario público de contacto
- Gestión de mensajes para administradores

#### Dashboard de administración

- Métricas de reservas y actividad

#### Usuarios administradores

- CRUD de usuarios administradores
- Gestión de credenciales

#### Autenticación

- Autenticación JWT
- Sistema de Refresh Tokens

---

## Fase 3 — Funcionalidades previstas

Mejoras futuras:

### Pagos

- Integración con Stripe
- Integración con PayPal

### Notificaciones por correo

- Confirmación de reservas por email
- Integración con SendGrid

### Frontend

- Aplicación React + TypeScript
- Dashboard administrativo

---

## Endpoints de la API

A continuación se muestran algunos de los principales endpoints expuestos por la API.

### Autenticación

```
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
```

### Tours

```
GET    /api/tours
GET    /api/tours/{id}
POST   /api/admin/tours
PUT    /api/admin/tours/{id}
DELETE /api/admin/tours/{id}
```

### Sesiones

```
GET    /api/sessions
GET    /api/sessions/{id}
POST   /api/admin/sessions
PUT    /api/admin/sessions/{id}
DELETE /api/admin/sessions/{id}
```

### Reservas

```
POST   /api/reservations
GET    /api/admin/reservations
GET    /api/admin/reservations/{id}
PUT    /api/admin/reservations/{id}
DELETE /api/admin/reservations/{id}
```

### Contacto

```
POST /api/contact
GET  /api/admin/messages
```

### Dashboard de administración

```
GET /api/admin/dashboard/metrics
```

La documentación completa de la API está disponible en **Swagger** al ejecutar el proyecto localmente.

---

## Estructura del proyecto

```
backend/MemoireNomade.API

Controllers/
Data/
DTOs/
Migrations/
Models/
Services/
Middleware/

Program.cs
appsettings.json
```

---

## Ejecución del proyecto

### 1 Clonar el repositorio

```
git clone https://github.com/GiovannyPanesso/memoire-nomade.git
```

### 2 Configurar la base de datos

Copiar el archivo:

```
appsettings.Development.example.json
```

Renombrarlo a:

```
appsettings.Development.json
```

Actualizar la cadena de conexión con tu instancia de SQL Server.

### 3 Ejecutar migraciones

```
dotnet ef database update
```

### 4 Ejecutar la API

```
dotnet run
```

La documentación Swagger estará disponible en:

```
https://localhost:5001/swagger
```

---

## Author

Personal full-stack development project created to practice modern technologies such as:

- .NET 8
- React
- TypeScript
- SQL Server
