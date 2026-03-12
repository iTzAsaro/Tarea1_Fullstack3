from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    @extend_schema(
        tags=['Health'],
        operation_id='health_check',
        summary='Health check',
        description='Verifica que el servicio esté operativo.',
        responses={
            200: inline_serializer(
                name='InventoryHealthResponse',
                fields={'ok': serializers.BooleanField()},
            )
        },
    )
    def get(self, request, *args, **kwargs):
        return Response({'ok': True})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', HealthView.as_view()),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('', include('productos.urls')),
]
