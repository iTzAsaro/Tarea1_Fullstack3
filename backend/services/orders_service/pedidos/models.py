from django.db import models


class Pedido(models.Model):
    cliente = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=50, default='creado')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
