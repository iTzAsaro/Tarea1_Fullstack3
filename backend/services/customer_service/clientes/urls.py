from django.urls import path

from .views import (
    ActualizarTicketView,
    AlertasClienteView,
    ClientesView,
    EventosClienteView,
    RecomendacionesView,
    TicketsSoporteView,
)

urlpatterns = [
    path('clientes/', ClientesView.as_view()),
    path('clientes/<int:cliente_id>/eventos/', EventosClienteView.as_view()),
    path('clientes/<int:cliente_id>/alertas/', AlertasClienteView.as_view()),
    path('recomendaciones/', RecomendacionesView.as_view()),
    path('tickets/', TicketsSoporteView.as_view()),
    path('tickets/<int:ticket_id>/actualizar/', ActualizarTicketView.as_view()),
]

