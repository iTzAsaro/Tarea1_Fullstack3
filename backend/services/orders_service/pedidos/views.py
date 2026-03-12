from rest_framework import generics
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from .models import Pedido
from .serializers import PedidoSerializer


class PedidosView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    @extend_schema(
        tags=['Pedidos'],
        operation_id='pedidos_list',
        summary='Listar pedidos',
        description=(
            'Retorna la lista de pedidos registrados. '
            'Cada pedido incluye cliente, total, estado y fecha de creación.'
        ),
        responses={200: PedidoSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Pedidos'],
        operation_id='pedidos_create',
        summary='Crear pedido',
        description=(
            'Crea un pedido. '
            'En este prototipo el campo `cliente` es texto libre y `total` es el monto del pedido. '
            'El campo `estado` permite simular el avance del flujo (por ejemplo: creado, pagado, enviado).'
        ),
        request=PedidoSerializer,
        responses={
            201: PedidoSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear pedido (ejemplo)',
                value={'cliente': 'Juan Pérez', 'total': '9900.00', 'estado': 'creado'},
                request_only=True,
            ),
            OpenApiExample(
                'Pedido creado (ejemplo)',
                value={
                    'id': 1,
                    'cliente': 'Juan Pérez',
                    'total': '9900.00',
                    'estado': 'creado',
                    'creado_en': '2026-03-12T21:00:00Z',
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
