from collections import Counter
from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    inline_serializer,
)
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cliente, EventoCliente, TicketSoporte
from .serializers import (
    ActualizarTicketSerializer,
    ClienteSerializer,
    CrearEventoSerializer,
    CrearTicketSerializer,
    EventoClienteSerializer,
    TicketSoporteSerializer,
)


class ClientesView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    @extend_schema(
        tags=['Clientes'],
        operation_id='clientes_list',
        summary='Listar clientes',
        description='Retorna perfiles de clientes con preferencias y etiquetas.',
        responses={200: ClienteSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Clientes'],
        operation_id='clientes_create',
        summary='Crear cliente',
        description='Crea un perfil de cliente. El email debe ser único.',
        request=ClienteSerializer,
        responses={
            201: ClienteSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear cliente (ejemplo)',
                value={
                    'email': 'cliente@shopsmart.cl',
                    'nombre': 'Cliente ShopSmart',
                    'telefono': '+56912345678',
                    'preferencias': {'canal': 'email', 'categorias': ['tecnologia', 'hogar']},
                    'etiquetas': ['vip'],
                },
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class EventosClienteView(APIView):
    @extend_schema(
        tags=['Eventos'],
        operation_id='clientes_events_list',
        summary='Listar eventos del cliente',
        description='Lista eventos de comportamiento asociados al cliente.',
        parameters=[
            OpenApiParameter(name='tipo', required=False, type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='since_id', required=False, type=int, location=OpenApiParameter.QUERY),
        ],
        responses={200: EventoClienteSerializer(many=True)},
    )
    def get(self, request, cliente_id: int, *args, **kwargs):
        qs = EventoCliente.objects.filter(cliente_id=cliente_id)
        tipo = request.query_params.get('tipo')
        since_id = request.query_params.get('since_id')
        if tipo:
            qs = qs.filter(tipo=tipo)
        if since_id:
            try:
                qs = qs.filter(id__gt=int(since_id))
            except ValueError:
                qs = qs.none()
        return Response(EventoClienteSerializer(qs.order_by('id'), many=True).data)

    @extend_schema(
        tags=['Eventos'],
        operation_id='clientes_events_create',
        summary='Registrar evento del cliente',
        description=(
            'Registra un evento (por ejemplo: `compra`, `vista`, `carrito`, `soporte`). '
            'Estos eventos alimentan personalización (recomendaciones) y soporte proactivo.'
        ),
        request=CrearEventoSerializer,
        responses={
            201: EventoClienteSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
            404: OpenApiResponse(description='Cliente no encontrado'),
        },
        examples=[
            OpenApiExample(
                'Evento compra (ejemplo)',
                value={'tipo': 'compra', 'sku': 'SKU-123', 'metadata': {'monto': 19990, 'categoria': 'tecnologia'}},
                request_only=True,
            ),
            OpenApiExample(
                'Evento vista (ejemplo)',
                value={'tipo': 'vista', 'sku': 'SKU-999', 'metadata': {'categoria': 'hogar'}},
                request_only=True,
            ),
        ],
    )
    def post(self, request, cliente_id: int, *args, **kwargs):
        if not Cliente.objects.filter(id=cliente_id).exists():
            return Response({'detail': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CrearEventoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        evento = EventoCliente.objects.create(
            cliente_id=cliente_id,
            tipo=data['tipo'],
            sku=data.get('sku', ''),
            metadata=data.get('metadata', {}) or {},
        )
        return Response(EventoClienteSerializer(evento).data, status=status.HTTP_201_CREATED)


class RecomendacionesView(APIView):
    @extend_schema(
        tags=['Recomendaciones'],
        operation_id='recomendaciones_get',
        summary='Recomendaciones para un cliente',
        description=(
            'Entrega recomendaciones simples basadas en el historial de eventos del cliente. '
            'En este prototipo, prioriza categorías/SKUs más frecuentes en eventos de compra/vista.'
        ),
        parameters=[
            OpenApiParameter(name='cliente_id', required=False, type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='email', required=False, type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='limit', required=False, type=int, location=OpenApiParameter.QUERY),
        ],
        responses={
            200: inline_serializer(
                name='RecomendacionesResponse',
                fields={
                    'cliente_id': serializers.IntegerField(allow_null=True),
                    'recomendaciones': inline_serializer(
                        name='RecomendacionItem',
                        fields={
                            'sku': serializers.CharField(),
                            'score': serializers.FloatField(),
                            'razon': serializers.CharField(),
                        },
                        many=True,
                    ),
                },
            ),
            400: OpenApiResponse(description='Debe enviar cliente_id o email'),
            404: OpenApiResponse(description='Cliente no encontrado'),
        },
    )
    def get(self, request, *args, **kwargs):
        cliente_id = request.query_params.get('cliente_id')
        email = request.query_params.get('email')
        limit = request.query_params.get('limit', '5')
        try:
            limit_int = max(1, min(20, int(limit)))
        except ValueError:
            limit_int = 5

        cliente = None
        if cliente_id:
            try:
                cliente = Cliente.objects.filter(id=int(cliente_id)).first()
            except ValueError:
                cliente = None
        elif email:
            cliente = Cliente.objects.filter(email=email).first()
        else:
            return Response({'detail': 'Debe enviar cliente_id o email'}, status=status.HTTP_400_BAD_REQUEST)

        if not cliente:
            return Response({'detail': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        eventos = EventoCliente.objects.filter(cliente=cliente, tipo__in=['compra', 'vista']).order_by('-id')[:200]
        categorias = []
        skus = []
        for e in eventos:
            if e.sku:
                skus.append(e.sku)
            categoria = (e.metadata or {}).get('categoria')
            if categoria:
                categorias.append(str(categoria))

        cat_counter = Counter(categorias)
        sku_counter = Counter(skus)

        recomendaciones = []
        total = sum(cat_counter.values()) + sum(sku_counter.values())
        if total == 0:
            return Response({'cliente_id': cliente.id, 'recomendaciones': []}, status=status.HTTP_200_OK)

        for sku, count in sku_counter.most_common(limit_int):
            score = round(count / max(1, total), 4)
            recomendaciones.append({'sku': sku, 'score': score, 'razon': 'Basado en tu historial'})

        if len(recomendaciones) < limit_int:
            for categoria, count in cat_counter.most_common(limit_int - len(recomendaciones)):
                score = round(count / max(1, total), 4)
                recomendaciones.append(
                    {
                        'sku': f'{categoria.upper()}-RECO',
                        'score': score,
                        'razon': f'Interés frecuente en categoría {categoria}',
                    }
                )

        return Response({'cliente_id': cliente.id, 'recomendaciones': recomendaciones[:limit_int]})


class TicketsSoporteView(APIView):
    @extend_schema(
        tags=['Soporte'],
        operation_id='tickets_list',
        summary='Listar tickets',
        description='Lista tickets de soporte. Filtros: `cliente_id`, `estado`.',
        parameters=[
            OpenApiParameter(name='cliente_id', required=False, type=int, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='estado', required=False, type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: TicketSoporteSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        qs = TicketSoporte.objects.all()
        cliente_id = request.query_params.get('cliente_id')
        estado = request.query_params.get('estado')
        if cliente_id:
            try:
                qs = qs.filter(cliente_id=int(cliente_id))
            except ValueError:
                qs = qs.none()
        if estado:
            qs = qs.filter(estado=estado)
        return Response(TicketSoporteSerializer(qs.order_by('id'), many=True).data)

    @extend_schema(
        tags=['Soporte'],
        operation_id='tickets_create',
        summary='Crear ticket',
        description='Crea un ticket de soporte asociado (opcionalmente) a un cliente.',
        request=CrearTicketSerializer,
        responses={
            201: TicketSoporteSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
            404: OpenApiResponse(description='Cliente no encontrado'),
        },
        examples=[
            OpenApiExample(
                'Crear ticket (ejemplo)',
                value={'cliente_id': 1, 'asunto': 'No puedo pagar', 'descripcion': 'Me da error en checkout', 'prioridad': 'alta'},
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        serializer = CrearTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cliente_id = data.get('cliente_id')
        if cliente_id is not None and not Cliente.objects.filter(id=cliente_id).exists():
            return Response({'detail': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        ticket = TicketSoporte.objects.create(
            cliente_id=cliente_id,
            asunto=data['asunto'],
            descripcion=data['descripcion'],
            estado='abierto',
            prioridad=data.get('prioridad', 'media'),
            asignado_a='',
        )
        return Response(TicketSoporteSerializer(ticket).data, status=status.HTTP_201_CREATED)


class ActualizarTicketView(APIView):
    @extend_schema(
        tags=['Soporte'],
        operation_id='tickets_update',
        summary='Actualizar ticket',
        description='Actualiza estado/prioridad/asignación del ticket.',
        request=ActualizarTicketSerializer,
        responses={
            200: TicketSoporteSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
            404: OpenApiResponse(description='Ticket no encontrado'),
        },
    )
    def post(self, request, ticket_id: int, *args, **kwargs):
        try:
            ticket = TicketSoporte.objects.get(id=ticket_id)
        except TicketSoporte.DoesNotExist:
            return Response({'detail': 'Ticket no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActualizarTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ticket.estado = data['estado']
        if 'prioridad' in data:
            ticket.prioridad = data['prioridad']
        if 'asignado_a' in data:
            ticket.asignado_a = data.get('asignado_a', '')
        ticket.save(update_fields=['estado', 'prioridad', 'asignado_a', 'actualizado_en'])
        return Response(TicketSoporteSerializer(ticket).data)


class AlertasClienteView(APIView):
    @extend_schema(
        tags=['Soporte'],
        operation_id='clientes_alerts',
        summary='Alertas proactivas',
        description=(
            'Entrega alertas simples para soporte proactivo (por ejemplo: alto volumen de tickets abiertos '
            'o inactividad prolongada).'
        ),
        responses={
            200: inline_serializer(
                name='AlertasClienteResponse',
                fields={
                    'cliente_id': serializers.IntegerField(),
                    'alertas': serializers.ListField(child=serializers.CharField()),
                },
            ),
            404: OpenApiResponse(description='Cliente no encontrado'),
        },
    )
    def get(self, request, cliente_id: int, *args, **kwargs):
        cliente = Cliente.objects.filter(id=cliente_id).first()
        if not cliente:
            return Response({'detail': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        alertas = []
        abiertos = TicketSoporte.objects.filter(cliente=cliente, estado__in=['abierto', 'en_progreso']).count()
        if abiertos >= 2:
            alertas.append('alto_volumen_soporte')

        ultimo_evento = EventoCliente.objects.filter(cliente=cliente).order_by('-id').first()
        if not ultimo_evento:
            alertas.append('sin_historial')
        else:
            if ultimo_evento.creado_en < timezone.now() - timedelta(days=30):
                alertas.append('cliente_inactivo')

        return Response({'cliente_id': cliente.id, 'alertas': alertas})

