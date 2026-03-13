from django.contrib import admin

from .models import Almacen, MovimientoStock, NivelStock

admin.site.register(Almacen)
admin.site.register(NivelStock)
admin.site.register(MovimientoStock)
