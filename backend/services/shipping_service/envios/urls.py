from django.urls import path

from .views import ActualizarEnvioView, CrearEnvioView, EnviosView

urlpatterns = [
    path('envios/', EnviosView.as_view()),
    path('envios/crear/', CrearEnvioView.as_view()),
    path('envios/<int:envio_id>/actualizar/', ActualizarEnvioView.as_view()),
]

