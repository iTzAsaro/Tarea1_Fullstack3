# Microservicios del Proyecto

Este repositorio implementa una arquitectura basada en microservicios para un e-commerce. Cada microservicio es un proyecto Django independiente y expone una API REST (JSON) para su dominio.

## Resumen

| Microservicio | Dominio / Función | Tecnología | Puerto local sugerido | Endpoints principales |
|---|---|---|---:|---|
| Inventory Service | Catálogo/stock de productos | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8001 | `GET/POST /productos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Orders Service | Creación y consulta de pedidos | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8002 | `GET/POST /pedidos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Users Service | Registro y consulta de usuarios | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8003 | `GET/POST /usuarios/`, `GET /health/`, `GET /docs/`, `GET /schema/` |

## Inventory Service (Inventario)

- **Nombre del servicio:** Inventory Service
- **Función específica:** Mantiene un catálogo básico de productos con stock y precio; habilita consultas y alta de productos.
- **Razones de integración (técnicas/negocio):**
  - Reduce desajustes de stock separando el dominio de inventario del resto de la plataforma.
  - Permite escalar y desplegar inventario de forma independiente (picos de consulta de catálogo).
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `GET /productos/`: lista productos.
  - `POST /productos/`: crea un producto (simulación).
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo (no hay llamadas HTTP entre servicios).
  - Dependencia conceptual: Orders Service debería validar disponibilidad/stock antes de confirmar un pedido.
- **Código:** [inventory_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/inventory_service)

## Orders Service (Pedidos)

- **Nombre del servicio:** Orders Service
- **Función específica:** Registra pedidos y permite listarlos/crearlos.
- **Razones de integración (técnicas/negocio):**
  - Aísla el procesamiento de pedidos para aumentar disponibilidad durante picos de tráfico.
  - Permite evolucionar el flujo de pedidos (pagos/envíos) sin impactar inventario o usuarios.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `GET /pedidos/`: lista pedidos.
  - `POST /pedidos/`: crea un pedido (simulación).
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: usa datos de usuario (Users Service) y disponibilidad de productos (Inventory Service) para validaciones del negocio.
- **Código:** [orders_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/orders_service)

## Users Service (Usuarios)

- **Nombre del servicio:** Users Service
- **Función específica:** Administra el registro y consulta de usuarios (datos básicos del cliente).
- **Razones de integración (técnicas/negocio):**
  - Centraliza datos de usuario para habilitar soporte/personalización sin acoplarlos al flujo de inventario/pedidos.
  - Permite escalar independientemente operaciones relacionadas a clientes.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `GET /usuarios/`: lista usuarios.
  - `POST /usuarios/`: crea un usuario (simulación).
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: Orders Service asocia pedidos a un cliente/usuario.
- **Código:** [users_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/users_service)

## Ejecución local (referencia)

Dependencias Python:

```powershell
py -m venv backend\.venv
& .\backend\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
```

Levantar servicios:

```powershell
& .\backend\.venv\Scripts\python.exe backend\services\inventory_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\inventory_service\manage.py runserver 8001

& .\backend\.venv\Scripts\python.exe backend\services\orders_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\orders_service\manage.py runserver 8002

& .\backend\.venv\Scripts\python.exe backend\services\users_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\users_service\manage.py runserver 8003
```

## Documentación Swagger (OpenAPI)

Cada microservicio expone su documentación en Swagger UI y su especificación OpenAPI en JSON.

1) Levanta el microservicio que quieras documentar (ver sección “Levantar servicios”).

2) Abre la documentación en el navegador:

- Inventory Service: `http://127.0.0.1:8001/docs/` (schema: `http://127.0.0.1:8001/schema/`)
- Orders Service: `http://127.0.0.1:8002/docs/` (schema: `http://127.0.0.1:8002/schema/`)
- Users Service: `http://127.0.0.1:8003/docs/` (schema: `http://127.0.0.1:8003/schema/`)

## Contribución al objetivo general

- **Inventory Service:** mejora la consistencia del stock y habilita escalamiento focalizado del catálogo, reduciendo cancelaciones por desajustes.
- **Orders Service:** incrementa disponibilidad del flujo crítico de compra al aislar pedidos, evitando que picos de demanda afecten a todo el sistema.
- **Users Service:** habilita gestión dedicada de clientes, facilitando personalización/soporte y evolución independiente de funcionalidades centradas en usuario.
