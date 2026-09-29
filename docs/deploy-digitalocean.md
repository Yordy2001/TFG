# Despliegue en DigitalOcean (Droplet + Docker Compose)

Guía para levantar el sistema temporalmente en un Droplet de DigitalOcean para que
la universidad pueda probarlo, y para apagarlo/destruirlo cuando termine la prueba.

## 1. Crear el Droplet

1. En DigitalOcean, crea un Droplet:
   - Imagen: **Ubuntu 24.04 LTS**
   - Plan: **Basic**, 1 vCPU / 1-2 GB RAM es suficiente (~$6-12/mes, se cobra por hora).
   - Añade tu clave SSH.
2. Anota la IP pública del Droplet.

## 2. Instalar Docker en el Droplet

Conéctate por SSH (`ssh root@<IP>`) y ejecuta:

```bash
curl -fsSL https://get.docker.com | sh
```

Docker Compose v2 viene incluido como `docker compose`.

## 3. Subir el proyecto

Desde tu máquina, clona/sube el repo al Droplet, o directamente en el Droplet:

```bash
git clone <URL_DEL_REPO>
cd app
```

## 4. Configurar variables de entorno

Copia el archivo de ejemplo y complétalo con valores reales:

```bash
cp .env.prod.example .env
nano .env
```

- `POSTGRES_PASSWORD`, `JWT_SECRET`, `IDENTITY_HASH_SALT`: usa valores aleatorios largos
  (por ejemplo `openssl rand -hex 32`).
- `CORS_ORIGIN`: pon `http://<IP_DEL_DROPLET>` (o el dominio si usas uno).

## 5. Levantar los servicios

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Esto construye las imágenes de backend y frontend, levanta Postgres, y aplica
las migraciones de Prisma automáticamente al iniciar el backend
(`prisma migrate deploy`, definido en `backend/Dockerfile`).

Verifica que todo esté corriendo:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

## 6. Probar

Abre `http://<IP_DEL_DROPLET>` en el navegador. El frontend (nginx) sirve la SPA
y reenvía las peticiones `/api/*` al backend.

Swagger de la API: `http://<IP_DEL_DROPLET>/api/docs`.

## 7. (Opcional) Cargar datos de prueba

Si el proyecto tiene seed:

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

## 8. Apagar / destruir cuando termine la prueba

Para detener los contenedores sin borrar el Droplet:

```bash
docker compose -f docker-compose.prod.yml down
```

Para apagar completamente y **dejar de pagar**, destruye el Droplet desde el
panel de DigitalOcean (Droplet → Destroy). Los datos de Postgres y los archivos
subidos viven en volúmenes Docker dentro del propio Droplet, así que se
eliminan junto con él — no hace falta limpieza adicional.

## Notas

- Este setup no incluye HTTPS. Si la prueba requiere HTTPS, la forma más simple
  es poner el Droplet detrás de un dominio y usar `certbot` con nginx, pero para
  una prueba corta con acceso solo por IP normalmente no es necesario.
- El plan Basic más pequeño puede quedarse corto de RAM al construir las
  imágenes (Angular build es pesado); si falla el build por memoria, usa un
  plan con 2 GB de RAM o construye las imágenes en otra máquina y súbelas a un
  registry.
