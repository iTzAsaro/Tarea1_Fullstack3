from rest_framework import serializers

from .models import Envio


class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio
        fields = [
            'id',
            'pedido_id',
            'direccion',
            'ciudad',
            'region',
            'pais',
            'estado',
            'tracking',
            'creado_en',
            'actualizado_en',
        ]


class CrearEnvioSerializer(serializers.Serializer):
    pedido_id = serializers.IntegerField()
    direccion = serializers.CharField(max_length=300)
    ciudad = serializers.CharField(max_length=120, required=False, allow_blank=True, default='')
    region = serializers.CharField(max_length=120, required=False, allow_blank=True, default='')
    pais = serializers.CharField(max_length=2, required=False, default='CL')


class ActualizarEnvioSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=['creado', 'preparado', 'enviado', 'entregado', 'cancelado'])
    tracking = serializers.CharField(required=False, allow_blank=True, default='')

