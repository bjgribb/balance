# Balance

A monorepo containing an Angular frontend, ASP.NET Core API, and PostgreSQL database.

## Structure

```
apps/
  web/              # Angular 21 frontend
  api/              # ASP.NET Core 10 REST API
  infrastructure/
    docker/         # Docker Compose for local services
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+) and npm
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## First-time Setup

### 1. Install frontend dependencies

```sh
cd apps/web
npm install
```

### 2. Configure API secrets

The API uses [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) to keep credentials out of source control.

```sh
cd apps/api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=balance;Username=<user>;Password=<password>"
```

Replace `<user>` and `<password>` with the values from your `.env` file at `apps/infrastructure/docker/.env`.

Set a JWT signing key for local development:

```sh
dotnet user-secrets set "Jwt:SecretKey" "<very-long-random-string>"
```

Use a long random value (at least 32 characters).

---

## Running the Project

### 1. Start the database

```sh
cd apps/infrastructure/docker
docker compose up -d
```

Postgres will be available at `localhost:5432`.

### 2. Start the API

```sh
cd apps/api
dotnet run
```

- HTTP: http://localhost:5245
- HTTPS: https://localhost:7074
- Swagger UI: http://localhost:5245/swagger

If the schema has changed, apply migrations first:

```sh
dotnet ef database update
```

### 3. Start the frontend

```sh
cd apps/web
npm start
```

App available at http://localhost:4200.

Auth pages are available at:

- http://localhost:4200/register
- http://localhost:4200/login

After sign-in, the app redirects to `/dashboard`.

---

## Authentication Notes

- API auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
- `GET /api/todos` is protected and requires `Authorization: Bearer <accessToken>`.
- Frontend auth state uses `sessionStorage` for access token, refresh token, and access-token expiration.
- The frontend automatically attempts a single token refresh on `401` responses, then retries the request.

### Quick API Auth Test

Use the HTTP request file at `apps/api/api.http` to manually test:

1. Register
2. Login
3. Refresh token
4. Authorized todos request

Run the API first (`dotnet run` in `apps/api`), then execute the requests in order.

---

## Development

### Linting & Formatting (frontend)

```sh
cd apps/web
npm run lint          # check for lint issues
npm run lint:fix      # auto-fix lint issues
npm run format        # auto-format all files
npm run format:check  # check formatting without writing
```

A pre-commit git hook runs `format:check` and `lint` automatically before every commit. Use `git commit --no-verify` to bypass in an emergency.

### Themes

The frontend supports Light, Dark, and System (OS preference) themes, toggled from the top bar. The selection is persisted in local storage.

---

## Stopping the Project

```sh
cd apps/infrastructure/docker
docker compose down
```
