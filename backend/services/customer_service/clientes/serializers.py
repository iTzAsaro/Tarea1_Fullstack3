from rest_framework import serializers

from .models import Cliente, EventoCliente, TicketSoporte


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'id',
            'email',
            'nombre',
            'telefono',
            'preferencias',
            'etiquetas',
            'creado_en',
            'actualizado_en',
        ]


class EventoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoCliente
        fields = ['id', 'cliente', 'tipo', 'sku', 'metadata', 'creado_en']


class CrearEventoSerializer(serializers.Serializer):
    tipo = serializers.CharField(max_length=50)
    sku = serializers.CharField(max_length=80, required=False, allow_blank=True, default='')
    metadata = serializers.JSONField(required=False, default=dict)


class TicketSoporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketSoporte
        fields = [
            'id',
            'cliente',
            'asunto',
            'descripcion',
            'estado',
            'prioridad',
            'asignado_a',
            'creado_en',
            'actualizado_en',
        ]


class CrearTicketSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField(required=False)
    asunto = serializers.CharField(max_length=200)
    descripcion = serializers.CharField()
    prioridad = serializers.ChoiceField(choices=['baja', 'media', 'alta'], required=False, default='media')


class ActualizarTicketSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=['abierto', 'en_progreso', 'resuelto', 'cerrado'])
    prioridad = serializers.ChoiceField(choices=['baja', 'media', 'alta'], required=False)
    asignado_a = serializers.CharField(max_length=120, required=False, allow_blank=True)

