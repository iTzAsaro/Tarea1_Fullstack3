from django.urls import path

from .views import ConfirmarPagoView, IniciarPagoView, PagosView

urlpatterns = [
    path('pagos/', PagosView.as_view()),
    path('pagos/iniciar/', IniciarPagoView.as_view()),
    path('pagos/<int:pago_id>/confirmar/', ConfirmarPagoView.as_view()),
]

