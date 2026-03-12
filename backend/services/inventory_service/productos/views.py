from rest_framework import generics

from .models import Producto
from .serializers import ProductoSerializer


class ProductosView(generics.ListCreateAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
