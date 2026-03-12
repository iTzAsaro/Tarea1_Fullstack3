from rest_framework import generics

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuariosView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
