# Backend (Microservicios - Django + DRF)

Este backend implementa microservicios separados (en el mismo repositorio) para cubrir los dominios descritos en el caso ShopSmart:

- Inventario: catálogo y stock.
- Pedidos: creación/listado de pedidos.
- Usuarios: listado/registro de usuarios.
- Stock: sincronización multi-almacén (niveles, ajustes y eventos).
- Pagos: intentos y confirmación de pagos (idempotencia básica).
- Envíos: creación de envíos y actualización de estado/tracking.
- Servicio al cliente: perfil, eventos, recomendaciones y soporte (tickets).

Cada microservicio es un proyecto Django independiente y expone:

- `GET /health/`
- Endpoints principales (REST + Swagger):
  - Inventario: `GET/POST /productos/` + `GET /docs/`
  - Pedidos: `GET/POST /pedidos/` + `GET /docs/`
  - Usuarios: `GET/POST /usuarios/` + `GET /docs/`
  - Stock: `GET/POST /almacenes/`, `GET /stock/niveles/`, `POST /stock/ajustes/`, `GET /stock/disponibilidad/`, `GET /stock/eventos/` + `GET /docs/`
  - Pagos: `POST /pagos/iniciar/`, `POST /pagos/<id>/confirmar/`, `GET /pagos/` + `GET /docs/`
  - Envíos: `POST /envios/crear/`, `POST /envios/<id>/actualizar/`, `GET /envios/` + `GET /docs/`
  - Servicio al cliente: `GET/POST /clientes/`, `GET/POST /clientes/<id>/eventos/`, `GET /clientes/<id>/alertas/`, `GET /recomendaciones/`, `GET/POST /tickets/`, `POST /tickets/<id>/actualizar/` + `GET /docs/`

## Requisitos

- Python 3.11+ (recomendado)

## Instalación

Desde la raíz del repo:

```powershell
py -m venv backend/.venv
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt
```

## Ejecutar microservicios

Inventario:

```powershell
backend\.venv\Scripts\python backend\services\inventory_service\manage.py migrate
backend\.venv\Scripts\python backend\services\inventory_service\manage.py runserver 8001
```

Pedidos:

```powershell
backend\.venv\Scripts\python backend\services\orders_service\manage.py migrate
backend\.venv\Scripts\python backend\services\orders_service\manage.py runserver 8002
```

Usuarios:

```powershell
backend\.venv\Scripts\python backend\services\users_service\manage.py migrate
backend\.venv\Scripts\python backend\services\users_service\manage.py runserver 8003
```

Stock:

```powershell
backend\.venv\Scripts\python backend\services\stock_service\manage.py migrate
backend\.venv\Scripts\python backend\services\stock_service\manage.py runserver 8004
```

Pagos:

```powershell
backend\.venv\Scripts\python backend\services\payments_service\manage.py migrate
backend\.venv\Scripts\python backend\services\payments_service\manage.py runserver 8005
```

Envíos:

```powershell
backend\.venv\Scripts\python backend\services\shipping_service\manage.py migrate
backend\.venv\Scripts\python backend\services\shipping_service\manage.py runserver 8006
```

Servicio al cliente:

```powershell
backend\.venv\Scripts\python backend\services\customer_service\manage.py migrate
backend\.venv\Scripts\python backend\services\customer_service\manage.py runserver 8007
```

## Tests

```powershell
backend\.venv\Scripts\python backend\services\inventory_service\manage.py test productos
backend\.venv\Scripts\python backend\services\orders_service\manage.py test pedidos
backend\.venv\Scripts\python backend\services\users_service\manage.py test usuarios
backend\.venv\Scripts\python backend\services\stock_service\manage.py test almacenes
backend\.venv\Scripts\python backend\services\payments_service\manage.py test pagos
backend\.venv\Scripts\python backend\services\shipping_service\manage.py test envios
backend\.venv\Scripts\python backend\services\customer_service\manage.py test clientes
```

