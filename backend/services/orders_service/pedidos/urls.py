from django.urls import path

from .views import PedidosView

urlpatterns = [
    path('pedidos', PedidosView.as_view()),
    path('pedidos/', PedidosView.as_view()),
]
