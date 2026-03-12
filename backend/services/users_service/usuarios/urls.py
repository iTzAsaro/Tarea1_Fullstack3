from django.urls import path

from .views import UsuariosView

urlpatterns = [
    path('usuarios', UsuariosView.as_view()),
    path('usuarios/', UsuariosView.as_view()),
]
