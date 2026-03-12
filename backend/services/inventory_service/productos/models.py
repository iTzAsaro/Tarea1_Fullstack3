from django.db import models


class Producto(models.Model):
    sku = models.CharField(max_length=64, unique=True)
    nombre = models.CharField(max_length=200)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
