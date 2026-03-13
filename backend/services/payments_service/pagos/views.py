from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Pago
from .serializers import ConfirmarPagoSerializer, IniciarPagoSerializer, PagoSerializer


class PagosView(generics.ListAPIView):
    serializer_class = PagoSerializer

    def get_queryset(self):
        qs = Pago.objects.all()
        pedido_id = self.request.query_params.get('pedido_id')
        estado = self.request.query_params.get('estado')
        if pedido_id:
            try:
                qs = qs.filter(pedido_id=int(pedido_id))
            except ValueError:
                qs = qs.none()
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    @extend_schema(
        tags=['Pagos'],
        operation_id='pagos_list',
        summary='Listar pagos',
        description='Lista intentos de pago. Filtros: `pedido_id`, `estado`.',
        parameters=[
            OpenApiParameter(name='pedido_id', required=False, type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='estado', required=False, type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: PagoSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class IniciarPagoView(APIView):
    @extend_schema(
        tags=['Pagos'],
        operation_id='pagos_create',
        summary='Iniciar pago',
        description=(
            'Crea un intento de pago para un pedido. '
            'Soporta idempotencia mediante `idempotency_key` + `proveedor`.\n\n'
            'Uso esperado en picos: el Orders Service delega la creación del pago a este servicio, '
            'reduciendo acoplamiento y permitiendo escalar pagos de forma independiente.'
        ),
        request=IniciarPagoSerializer,
        responses={
            201: PagoSerializer,
            200: PagoSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Iniciar pago (ejemplo)',
                value={'pedido_id': 1001, 'monto': '19990.00', 'moneda': 'CLP', 'idempotency_key': 'pay-1001-1'},
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        serializer = IniciarPagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        proveedor = data.get('proveedor', 'simulado')
        idempotency_key = data.get('idempotency_key', '')
        if idempotency_key:
            pago = Pago.objects.filter(proveedor=proveedor, idempotency_key=idempotency_key).first()
            if pago:
                return Response(PagoSerializer(pago).data, status=status.HTTP_200_OK)

        pago = Pago.objects.create(
            pedido_id=data['pedido_id'],
            monto=data['monto'],
            moneda=data.get('moneda', 'CLP'),
            proveedor=proveedor,
            estado='pendiente',
            idempotency_key=idempotency_key,
        )
        return Response(PagoSerializer(pago).data, status=status.HTTP_201_CREATED)


class ConfirmarPagoView(APIView):
    @extend_schema(
        tags=['Pagos'],
        operation_id='pagos_confirm',
        summary='Confirmar pago',
        description=(
            'Actualiza el resultado del pago. Simula el callback/proceso del proveedor.\n\n'
            'Estados:\n'
            '- `autorizado`: pago exitoso.\n'
            '- `rechazado`: pago fallido.'
        ),
        request=ConfirmarPagoSerializer,
        responses={
            200: PagoSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación/estado no permitido)'),
            404: OpenApiResponse(description='Pago no encontrado'),
        },
        examples=[
            OpenApiExample('Confirmar autorizado', value={'estado': 'autorizado'}, request_only=True),
            OpenApiExample('Confirmar rechazado', value={'estado': 'rechazado', 'motivo': 'fondos insuficientes'}, request_only=True),
        ],
    )
    def post(self, request, pago_id: int, *args, **kwargs):
        try:
            pago = Pago.objects.get(id=pago_id)
        except Pago.DoesNotExist:
            return Response({'detail': 'Pago no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ConfirmarPagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nuevo_estado = serializer.validated_data['estado']

        if pago.estado != 'pendiente':
            return Response({'detail': 'El pago ya fue confirmado'}, status=status.HTTP_400_BAD_REQUEST)

        pago.estado = nuevo_estado
        pago.save(update_fields=['estado', 'actualizado_en'])
        return Response(PagoSerializer(pago).data, status=status.HTTP_200_OK)

