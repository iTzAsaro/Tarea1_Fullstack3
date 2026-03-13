from django.db import models


class Almacen(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    ubicacion = models.CharField(max_length=200, blank=True, default='')
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']


class NivelStock(models.Model):
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE, related_name='niveles_stock')
    sku = models.CharField(max_length=80)
    cantidad = models.IntegerField(default=0)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(fields=['almacen', 'sku'], name='uniq_stock_por_almacen_y_sku')
        ]


class MovimientoStock(models.Model):
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE, related_name='movimientos_stock')
    sku = models.CharField(max_length=80)
    delta = models.IntegerField()
    motivo = models.CharField(max_length=200)
    referencia = models.CharField(max_length=200, blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

