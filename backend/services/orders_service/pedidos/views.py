from rest_framework import generics

from .models import Pedido
from .serializers import PedidoSerializer


class PedidosView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
