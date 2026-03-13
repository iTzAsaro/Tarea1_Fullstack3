from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Envio
from .serializers import ActualizarEnvioSerializer, CrearEnvioSerializer, EnvioSerializer


class EnviosView(generics.ListAPIView):
    serializer_class = EnvioSerializer

    def get_queryset(self):
        qs = Envio.objects.all()
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
        tags=['Envíos'],
        operation_id='envios_list',
        summary='Listar envíos',
        description='Lista envíos. Filtros: `pedido_id`, `estado`.',
        parameters=[
            OpenApiParameter(name='pedido_id', required=False, type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='estado', required=False, type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: EnvioSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CrearEnvioView(APIView):
    @extend_schema(
        tags=['Envíos'],
        operation_id='envios_create',
        summary='Crear envío',
        description=(
            'Crea un envío asociado a un pedido. '
            'En picos de demanda, el Orders Service delega logística a este servicio para evitar cuellos de botella.'
        ),
        request=CrearEnvioSerializer,
        responses={
            201: EnvioSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear envío (ejemplo)',
                value={
                    'pedido_id': 1001,
                    'direccion': 'Av. Siempre Viva 742',
                    'ciudad': 'Santiago',
                    'region': 'RM',
                    'pais': 'CL',
                },
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        serializer = CrearEnvioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        envio = Envio.objects.create(
            pedido_id=data['pedido_id'],
            direccion=data['direccion'],
            ciudad=data.get('ciudad', ''),
            region=data.get('region', ''),
            pais=data.get('pais', 'CL'),
            estado='creado',
            tracking='',
        )
        return Response(EnvioSerializer(envio).data, status=status.HTTP_201_CREATED)


class ActualizarEnvioView(APIView):
    @extend_schema(
        tags=['Envíos'],
        operation_id='envios_update',
        summary='Actualizar estado/tracking',
        description=(
            'Actualiza el estado y/o tracking del envío. '
            'Simula eventos de logística (preparación, despacho, entrega).'
        ),
        request=ActualizarEnvioSerializer,
        responses={
            200: EnvioSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
            404: OpenApiResponse(description='Envío no encontrado'),
        },
        examples=[
            OpenApiExample('Marcar preparado', value={'estado': 'preparado'}, request_only=True),
            OpenApiExample(
                'Marcar enviado con tracking',
                value={'estado': 'enviado', 'tracking': 'TRACK-123'},
                request_only=True,
            ),
        ],
    )
    def post(self, request, envio_id: int, *args, **kwargs):
        try:
            envio = Envio.objects.get(id=envio_id)
        except Envio.DoesNotExist:
            return Response({'detail': 'Envío no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActualizarEnvioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        envio.estado = data['estado']
        tracking = data.get('tracking')
        if tracking is not None:
            envio.tracking = tracking
        envio.save(update_fields=['estado', 'tracking', 'actualizado_en'])
        return Response(EnvioSerializer(envio).data, status=status.HTTP_200_OK)

