from django.urls import path

from .views import AlmacenesView, AjustesStockView, DisponibilidadStockView, EventosStockView, NivelesStockView

urlpatterns = [
    path('almacenes/', AlmacenesView.as_view()),
    path('stock/niveles/', NivelesStockView.as_view()),
    path('stock/ajustes/', AjustesStockView.as_view()),
    path('stock/disponibilidad/', DisponibilidadStockView.as_view()),
    path('stock/eventos/', EventosStockView.as_view()),
]

