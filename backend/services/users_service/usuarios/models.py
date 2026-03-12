from django.db import models


class Usuario(models.Model):
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=200)
    telefono = models.CharField(max_length=30, blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
