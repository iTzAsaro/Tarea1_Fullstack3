from django.db import transaction
from django.db.models import Sum
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Almacen, MovimientoStock, NivelStock
from .serializers import (
    AjusteStockSerializer,
    AlmacenSerializer,
    MovimientoStockSerializer,
    NivelStockSerializer,
)


class AlmacenesView(generics.ListCreateAPIView):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer

    @extend_schema(
        tags=['Almacenes'],
        operation_id='almacenes_list',
        summary='Listar almacenes',
        description='Retorna los almacenes registrados (sucursales/bodegas).',
        responses={200: AlmacenSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Almacenes'],
        operation_id='almacenes_create',
        summary='Crear almacén',
        description='Crea un almacén. El campo `codigo` debe ser único.',
        request=AlmacenSerializer,
        responses={
            201: AlmacenSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear almacén (ejemplo)',
                value={'codigo': 'SCL-CENTRO', 'nombre': 'Bodega Santiago Centro', 'ubicacion': 'Santiago'},
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class NivelesStockView(generics.ListAPIView):
    serializer_class = NivelStockSerializer

    def get_queryset(self):
        qs = NivelStock.objects.select_related('almacen').all()
        sku = self.request.query_params.get('sku')
        almacen_codigo = self.request.query_params.get('almacen_codigo')
        if sku:
            qs = qs.filter(sku=sku)
        if almacen_codigo:
            qs = qs.filter(almacen__codigo=almacen_codigo)
        return qs

    @extend_schema(
        tags=['Stock'],
        operation_id='stock_levels_list',
        summary='Listar niveles de stock',
        description='Lista niveles de stock por SKU y almacén. Se puede filtrar por `sku` y/o `almacen_codigo`.',
        parameters=[
            OpenApiParameter(name='sku', required=False, type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(
                name='almacen_codigo', required=False, type=str, location=OpenApiParameter.QUERY
            ),
        ],
        responses={200: NivelStockSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class AjustesStockView(APIView):
    @extend_schema(
        tags=['Stock'],
        operation_id='stock_adjust',
        summary='Ajustar stock (movimiento)',
        description=(
            'Registra un movimiento de stock (delta positivo o negativo) para un SKU en un almacén. '
            'Actualiza el nivel de stock y genera un evento consultable en `/stock/eventos/`.\n\n'
            'Este endpoint permite sincronización “en tiempo real” mediante integración: '
            'cada sistema de bodega puede publicar ajustes conforme ocurren recepciones, ventas o transferencias.'
        ),
        request=AjusteStockSerializer,
        responses={
            201: inline_serializer(
                name='AjusteStockResponse',
                fields={
                    'nivel': NivelStockSerializer(),
                    'movimiento': MovimientoStockSerializer(),
                },
            ),
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
            404: OpenApiResponse(description='Almacén no encontrado'),
        },
        examples=[
            OpenApiExample(
                'Ingreso por recepción (ejemplo)',
                value={
                    'almacen_codigo': 'SCL-CENTRO',
                    'sku': 'SKU-123',
                    'delta': 10,
                    'motivo': 'recepcion',
                    'referencia': 'OC-1001',
                },
                request_only=True,
            ),
            OpenApiExample(
                'Egreso por venta (ejemplo)',
                value={
                    'almacen_codigo': 'SCL-CENTRO',
                    'sku': 'SKU-123',
                    'delta': -2,
                    'motivo': 'venta',
                    'referencia': 'PED-9001',
                },
                request_only=True,
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        serializer = AjusteStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            almacen = Almacen.objects.get(codigo=data['almacen_codigo'])
        except Almacen.DoesNotExist:
            return Response({'detail': 'Almacén no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            nivel, _created = NivelStock.objects.select_for_update().get_or_create(
                almacen=almacen, sku=data['sku'], defaults={'cantidad': 0}
            )
            nivel.cantidad = nivel.cantidad + data['delta']
            nivel.save(update_fields=['cantidad', 'actualizado_en'])

            movimiento = MovimientoStock.objects.create(
                almacen=almacen,
                sku=data['sku'],
                delta=data['delta'],
                motivo=data['motivo'],
                referencia=data.get('referencia', ''),
            )

        return Response(
            {
                'nivel': NivelStockSerializer(nivel).data,
                'movimiento': MovimientoStockSerializer(movimiento).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DisponibilidadStockView(APIView):
    @extend_schema(
        tags=['Stock'],
        operation_id='stock_availability',
        summary='Consultar disponibilidad agregada',
        description=(
            'Retorna la disponibilidad total de un SKU sumando todos los almacenes, y el detalle por almacén. '
            'Permite decidir si un producto marcado como disponible en catálogo realmente tiene stock.'
        ),
        parameters=[OpenApiParameter(name='sku', required=True, type=str, location=OpenApiParameter.QUERY)],
        responses={
            200: inline_serializer(
                name='DisponibilidadStockResponse',
                fields={
                    'sku': serializers.CharField(),
                    'total': serializers.IntegerField(),
                    'por_almacen': inline_serializer(
                        name='DisponibilidadPorAlmacen',
                        fields={
                            'almacen_codigo': serializers.CharField(),
                            'almacen_nombre': serializers.CharField(),
                            'cantidad': serializers.IntegerField(),
                        },
                        many=True,
                    ),
                },
            ),
            400: OpenApiResponse(description='Falta el parámetro sku'),
        },
        examples=[
            OpenApiExample(
                'Disponibilidad (ejemplo)',
                value={
                    'sku': 'SKU-123',
                    'total': 23,
                    'por_almacen': [
                        {'almacen_codigo': 'SCL-CENTRO', 'almacen_nombre': 'Bodega Santiago Centro', 'cantidad': 20},
                        {'almacen_codigo': 'VLP-01', 'almacen_nombre': 'Bodega Valparaíso', 'cantidad': 3},
                    ],
                },
                response_only=True,
            )
        ],
    )
    def get(self, request, *args, **kwargs):
        sku = request.query_params.get('sku')
        if not sku:
            return Response({'detail': 'Falta el parámetro sku'}, status=status.HTTP_400_BAD_REQUEST)

        niveles = (
            NivelStock.objects.select_related('almacen')
            .filter(sku=sku, almacen__activo=True)
            .order_by('almacen__codigo')
        )
        total = niveles.aggregate(total=Sum('cantidad'))['total'] or 0
        por_almacen = [
            {
                'almacen_codigo': n.almacen.codigo,
                'almacen_nombre': n.almacen.nombre,
                'cantidad': n.cantidad,
            }
            for n in niveles
        ]

        return Response({'sku': sku, 'total': total, 'por_almacen': por_almacen})


class EventosStockView(generics.ListAPIView):
    serializer_class = MovimientoStockSerializer

    def get_queryset(self):
        qs = MovimientoStock.objects.select_related('almacen').all()
        since_id = self.request.query_params.get('since_id')
        sku = self.request.query_params.get('sku')
        almacen_codigo = self.request.query_params.get('almacen_codigo')

        if since_id:
            try:
                since_id_int = int(since_id)
                qs = qs.filter(id__gt=since_id_int)
            except ValueError:
                qs = qs.none()
        if sku:
            qs = qs.filter(sku=sku)
        if almacen_codigo:
            qs = qs.filter(almacen__codigo=almacen_codigo)

        return qs.order_by('id')

    @extend_schema(
        tags=['Stock'],
        operation_id='stock_events_list',
        summary='Listar eventos de stock',
        description=(
            'Entrega movimientos de stock (eventos) para consumo incremental. '
            'Útil para integraciones “casi en tiempo real” con POS/ERP/WMS usando polling.\n\n'
            'Filtros: `since_id` (solo eventos con id mayor), `sku`, `almacen_codigo`.'
        ),
        parameters=[
            OpenApiParameter(name='since_id', required=False, type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='sku', required=False, type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(
                name='almacen_codigo', required=False, type=str, location=OpenApiParameter.QUERY
            ),
        ],
        responses={200: MovimientoStockSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

