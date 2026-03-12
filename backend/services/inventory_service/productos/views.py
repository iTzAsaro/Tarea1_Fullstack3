from rest_framework import generics
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from .models import Producto
from .serializers import ProductoSerializer


class ProductosView(generics.ListCreateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    @extend_schema(
        tags=['Productos'],
        operation_id='productos_list',
        summary='Listar productos',
        description=(
            'Retorna el catálogo de productos. '
            'Cada producto incluye SKU, nombre, precio, stock y fecha de creación.'
        ),
        responses={200: ProductoSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Productos'],
        operation_id='productos_create',
        summary='Crear producto',
        description=(
            'Crea un nuevo producto en el catálogo. '
            'El campo `sku` debe ser único. '
            'Los campos `precio` y `stock` representan el precio unitario y la cantidad disponible.'
        ),
        request=ProductoSerializer,
        responses={
            201: ProductoSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear producto (ejemplo)',
                value={'sku': 'SKU-123', 'nombre': 'Polera Básica', 'precio': '14990.00', 'stock': 25},
                request_only=True,
            ),
            OpenApiExample(
                'Producto creado (ejemplo)',
                value={
                    'id': 1,
                    'sku': 'SKU-123',
                    'nombre': 'Polera Básica',
                    'precio': '14990.00',
                    'stock': 25,
                    'creado_en': '2026-03-12T21:00:00Z',
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
