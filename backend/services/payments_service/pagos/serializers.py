from rest_framework import serializers

from .models import Pago


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = [
            'id',
            'pedido_id',
            'monto',
            'moneda',
            'proveedor',
            'estado',
            'idempotency_key',
            'creado_en',
            'actualizado_en',
        ]


class IniciarPagoSerializer(serializers.Serializer):
    pedido_id = serializers.IntegerField()
    monto = serializers.DecimalField(max_digits=12, decimal_places=2)
    moneda = serializers.CharField(max_length=10, required=False, default='CLP')
    proveedor = serializers.CharField(max_length=50, required=False, default='simulado')
    idempotency_key = serializers.CharField(required=False, allow_blank=True, default='')


class ConfirmarPagoSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=['autorizado', 'rechazado'])
    motivo = serializers.CharField(required=False, allow_blank=True, default='')

