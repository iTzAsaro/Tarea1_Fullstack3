from django.db import models


class Cliente(models.Model):
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=30, blank=True, default='')
    preferencias = models.JSONField(default=dict, blank=True)
    etiquetas = models.JSONField(default=list, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']


class EventoCliente(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='eventos')
    tipo = models.CharField(max_length=50)
    sku = models.CharField(max_length=80, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']


class TicketSoporte(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    asunto = models.CharField(max_length=200)
    descripcion = models.TextField()
    estado = models.CharField(max_length=30, default='abierto')
    prioridad = models.CharField(max_length=20, default='media')
    asignado_a = models.CharField(max_length=120, blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

