from django.db import models


class Envio(models.Model):
    pedido_id = models.IntegerField()
    direccion = models.CharField(max_length=300)
    ciudad = models.CharField(max_length=120, blank=True, default='')
    region = models.CharField(max_length=120, blank=True, default='')
    pais = models.CharField(max_length=2, default='CL')
    estado = models.CharField(max_length=30, default='creado')
    tracking = models.CharField(max_length=120, blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

