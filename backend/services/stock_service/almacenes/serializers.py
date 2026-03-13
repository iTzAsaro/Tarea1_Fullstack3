from rest_framework import serializers

from .models import Almacen, MovimientoStock, NivelStock


class AlmacenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Almacen
        fields = ['id', 'codigo', 'nombre', 'ubicacion', 'activo', 'creado_en']


class NivelStockSerializer(serializers.ModelSerializer):
    almacen_codigo = serializers.CharField(source='almacen.codigo', read_only=True)

    class Meta:
        model = NivelStock
        fields = ['id', 'almacen', 'almacen_codigo', 'sku', 'cantidad', 'actualizado_en']


class MovimientoStockSerializer(serializers.ModelSerializer):
    almacen_codigo = serializers.CharField(source='almacen.codigo', read_only=True)

    class Meta:
        model = MovimientoStock
        fields = ['id', 'almacen', 'almacen_codigo', 'sku', 'delta', 'motivo', 'referencia', 'creado_en']


class AjusteStockSerializer(serializers.Serializer):
    almacen_codigo = serializers.CharField()
    sku = serializers.CharField(max_length=80)
    delta = serializers.IntegerField()
    motivo = serializers.CharField(max_length=200)
    referencia = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')

