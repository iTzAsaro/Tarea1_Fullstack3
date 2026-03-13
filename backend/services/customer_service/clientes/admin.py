from django.contrib import admin

from .models import Cliente, EventoCliente, TicketSoporte

admin.site.register(Cliente)
admin.site.register(EventoCliente)
admin.site.register(TicketSoporte)
