# Microservicios del Proyecto

Este repositorio implementa una arquitectura basada en microservicios para un e-commerce. Cada microservicio es un proyecto Django independiente y expone una API REST (JSON) para su dominio.

## Resumen

| Microservicio | Dominio / Función | Tecnología | Puerto local sugerido | Endpoints principales |
|---|---|---|---:|---|
| Inventory Service | Catálogo/stock de productos | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8001 | `GET/POST /productos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Orders Service | Creación y consulta de pedidos | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8002 | `GET/POST /pedidos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Users Service | Registro y consulta de usuarios | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8003 | `GET/POST /usuarios/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Stock Service | Sincronización de stock multi-almacén (niveles, ajustes y eventos) | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8004 | `GET/POST /almacenes/`, `GET /stock/niveles/`, `POST /stock/ajustes/`, `GET /stock/disponibilidad/`, `GET /stock/eventos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Payments Service | Procesamiento de pagos (intentos + confirmación) | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8005 | `POST /pagos/iniciar/`, `POST /pagos/{id}/confirmar/`, `GET /pagos/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Shipping Service | Gestión de envíos (creación + estado/tracking) | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8006 | `POST /envios/crear/`, `POST /envios/{id}/actualizar/`, `GET /envios/`, `GET /health/`, `GET /docs/`, `GET /schema/` |
| Customer Service | Servicio al cliente (perfil, eventos, recomendaciones y soporte) | Python, Django, Django REST Framework, Swagger (OpenAPI) | 8007 | `GET/POST /clientes/`, `GET/POST /clientes/{id}/eventos/`, `GET /clientes/{id}/alertas/`, `GET /recomendaciones/`, `GET/POST /tickets/`, `POST /tickets/{id}/actualizar/`, `GET /health/`, `GET /docs/`, `GET /schema/` |

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

## Payments Service (Pagos)

- **Nombre del servicio:** Payments Service
- **Función específica:** Procesa pagos de forma desacoplada al flujo de pedidos (creación de intentos y confirmación del resultado). Esto permite escalar pagos independientemente durante picos de tráfico.
- **Razones de integración (técnicas/negocio):**
  - Evita cuellos de botella del monolito aislando el procesamiento de pagos (componente crítico y sensible a latencias).
  - Soporta reintentos seguros con idempotencia (`idempotency_key`) para prevenir cobros duplicados en reintentos.
  - Permite integrar proveedores de pago sin impactar el resto de los dominios.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), Swagger (OpenAPI), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `POST /pagos/iniciar/`: crea (o reusa por idempotencia) un intento de pago.
  - `POST /pagos/<id>/confirmar/`: confirma el resultado del pago (simulación del proveedor).
  - `GET /pagos/`: lista pagos (filtros: `pedido_id`, `estado`).
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: Orders Service delega la creación/confirmación de pagos y actualiza el estado del pedido según el resultado.
- **Código:** [payments_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/payments_service)

## Shipping Service (Envíos)

- **Nombre del servicio:** Shipping Service
- **Función específica:** Administra la creación de envíos para pedidos y su avance de estado/tracking, desacoplándolo del servicio de pedidos para mejorar confiabilidad bajo alta demanda.
- **Razones de integración (técnicas/negocio):**
  - Reduce latencias al separar logística del flujo de creación del pedido.
  - Permite procesar actualizaciones asíncronas (preparado/enviado/entregado) sin bloquear el checkout.
  - Facilita escalar el componente de logística y/o integrar transportistas.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), Swagger (OpenAPI), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `POST /envios/crear/`: crea un envío para un pedido.
  - `POST /envios/<id>/actualizar/`: actualiza estado y tracking.
  - `GET /envios/`: lista envíos (filtros: `pedido_id`, `estado`).
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: Orders Service crea el envío al confirmar pago, y puede reflejar el estado del envío al cliente.
- **Código:** [shipping_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/shipping_service)

## Customer Service (Servicio al cliente)

- **Nombre del servicio:** Customer Service
- **Función específica:** Centraliza el perfil del cliente, preferencias, eventos de comportamiento (compras/vistas) y soporte (tickets). Entrega recomendaciones básicas y alertas para soporte proactivo.
- **Razones de integración (técnicas/negocio):**
  - Habilita personalización (recomendaciones) sin acoplar lógica de “customer intelligence” al monolito o a pedidos.
  - Permite soporte proactivo con alertas (por ejemplo: alto volumen de tickets abiertos o inactividad).
  - Escala de forma independiente el manejo de datos de cliente, mejorando fidelización.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), Swagger (OpenAPI), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `GET/POST /clientes/`: lista/crea perfiles.
  - `GET/POST /clientes/<id>/eventos/`: lista/crea eventos de cliente.
  - `GET /recomendaciones/?cliente_id=...`: recomendaciones basadas en eventos.
  - `GET/POST /tickets/`: lista/crea tickets.
  - `POST /tickets/<id>/actualizar/`: actualiza estado/prioridad/asignación.
  - `GET /clientes/<id>/alertas/`: alertas proactivas.
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: Orders/Payments/Shipping podrían publicar eventos o abrir tickets para enriquecer el historial del cliente.
- **Código:** [customer_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/customer_service)

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

## Stock Service (Stock multi-almacén)

- **Nombre del servicio:** Stock Service
- **Función específica:** Mantiene niveles de stock por SKU y por almacén (bodega/sucursal). Expone ajustes (movimientos) para sincronizar cambios en “tiempo real” y permite consultar disponibilidad agregada para evitar ventas con stock inexistente.
- **Razones de integración (técnicas/negocio):**
  - Reduce cancelaciones al consultar stock real por almacén (y total), evitando depender de un stock único desincronizado.
  - Permite incorporar nuevos almacenes sin re-diseñar el modelo: cada almacén publica eventos de stock (WMS/ERP/POS) de forma independiente.
  - Escala el dominio de stock de forma aislada y habilita integraciones externas (múltiples fuentes) mediante un endpoint de ajustes y un stream incremental de eventos.
- **Tecnologías utilizadas:** Python, Django, Django REST Framework, SQLite (desarrollo), Swagger (OpenAPI), JSON.
- **Endpoints principales:**
  - `GET /health/`: verificación de salud del servicio.
  - `GET /docs/`: Swagger UI del servicio.
  - `GET /schema/`: especificación OpenAPI en JSON.
  - `GET/POST /almacenes/`: lista/crea almacenes.
  - `GET /stock/niveles/`: lista niveles por SKU y almacén (filtros: `sku`, `almacen_codigo`).
  - `POST /stock/ajustes/`: registra un movimiento de stock (`delta`) y actualiza el nivel.
  - `GET /stock/disponibilidad/?sku=...`: disponibilidad total y por almacén.
  - `GET /stock/eventos/?since_id=...`: eventos incrementales para consumo “casi en tiempo real”.
- **Dependencias con otros servicios:**
  - Dependencia técnica directa: ninguna en este prototipo.
  - Dependencia conceptual: Inventory Service define el catálogo (SKU) y Orders Service debe validar disponibilidad llamando a `GET /stock/disponibilidad/`.
- **Código:** [stock_service](file:///c:/Developer/Tarea1_Fullstack3/backend/services/stock_service)

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

& .\backend\.venv\Scripts\python.exe backend\services\stock_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\stock_service\manage.py runserver 8004

& .\backend\.venv\Scripts\python.exe backend\services\payments_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\payments_service\manage.py runserver 8005

& .\backend\.venv\Scripts\python.exe backend\services\shipping_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\shipping_service\manage.py runserver 8006

& .\backend\.venv\Scripts\python.exe backend\services\customer_service\manage.py migrate
& .\backend\.venv\Scripts\python.exe backend\services\customer_service\manage.py runserver 8007
```

## Documentación Swagger (OpenAPI)

Cada microservicio expone su documentación en Swagger UI y su especificación OpenAPI en JSON.

1) Levanta el microservicio que quieras documentar (ver sección “Levantar servicios”).

2) Abre la documentación en el navegador:

- Inventory Service: `http://127.0.0.1:8001/docs/` (schema: `http://127.0.0.1:8001/schema/`)
- Orders Service: `http://127.0.0.1:8002/docs/` (schema: `http://127.0.0.1:8002/schema/`)
- Users Service: `http://127.0.0.1:8003/docs/` (schema: `http://127.0.0.1:8003/schema/`)
- Stock Service: `http://127.0.0.1:8004/docs/` (schema: `http://127.0.0.1:8004/schema/`)
- Payments Service: `http://127.0.0.1:8005/docs/` (schema: `http://127.0.0.1:8005/schema/`)
- Shipping Service: `http://127.0.0.1:8006/docs/` (schema: `http://127.0.0.1:8006/schema/`)
- Customer Service: `http://127.0.0.1:8007/docs/` (schema: `http://127.0.0.1:8007/schema/`)

## Contribución al objetivo general

- **Inventory Service:** mejora la consistencia del stock y habilita escalamiento focalizado del catálogo, reduciendo cancelaciones por desajustes.
- **Orders Service:** incrementa disponibilidad del flujo crítico de compra al aislar pedidos, evitando que picos de demanda afecten a todo el sistema.
- **Users Service:** habilita gestión dedicada de clientes, facilitando personalización/soporte y evolución independiente de funcionalidades centradas en usuario.
- **Stock Service:** sincroniza stock multi-almacén con eventos y niveles por bodega, reduciendo desajustes y habilitando escalamiento al sumar nuevos almacenes.
- **Payments Service:** desacopla pagos del flujo de pedidos, soportando reintentos idempotentes y escalamiento independiente en picos.
- **Shipping Service:** desacopla logística del checkout, permitiendo procesar envíos y tracking sin bloquear pedidos durante alta demanda.
- **Customer Service:** habilita personalización (recomendaciones) y soporte proactivo basado en eventos, incrementando fidelización y mejorando experiencia del cliente.
