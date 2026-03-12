# Backend (Microservicios - Django + DRF)

Este backend implementa microservicios separados (en el mismo repositorio) para cubrir los dominios descritos en el caso ShopSmart:

- Inventario: catálogo y stock.
- Pedidos: creación/listado de pedidos.
- Usuarios: listado/registro de usuarios.

Cada microservicio es un proyecto Django independiente y expone:

- `GET /health/`
- 2 endpoints principales (GET/POST):
  - Inventario: `GET/POST /productos/`
  - Pedidos: `GET/POST /pedidos/`
  - Usuarios: `GET/POST /usuarios/`

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

## Tests

```powershell
backend\.venv\Scripts\python backend\services\inventory_service\manage.py test productos
backend\.venv\Scripts\python backend\services\orders_service\manage.py test pedidos
backend\.venv\Scripts\python backend\services\users_service\manage.py test usuarios
```
