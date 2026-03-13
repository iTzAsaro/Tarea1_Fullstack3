from django.db import models


class Pago(models.Model):
    pedido_id = models.IntegerField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.CharField(max_length=10, default='CLP')
    proveedor = models.CharField(max_length=50, default='simulado')
    estado = models.CharField(max_length=30, default='pendiente')
    idempotency_key = models.CharField(max_length=200, blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(
                fields=['proveedor', 'idempotency_key'],
                name='uniq_pago_idempotency',
                condition=~models.Q(idempotency_key=''),
            )
        ]

