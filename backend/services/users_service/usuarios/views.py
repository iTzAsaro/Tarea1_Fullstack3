from rest_framework import generics
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuariosView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    @extend_schema(
        tags=['Usuarios'],
        operation_id='usuarios_list',
        summary='Listar usuarios',
        description='Retorna la lista de usuarios registrados (email, nombre, teléfono y fecha de creación).',
        responses={200: UsuarioSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Usuarios'],
        operation_id='usuarios_create',
        summary='Crear usuario',
        description=(
            'Crea un usuario. '
            'El campo `email` debe ser único. '
            'El campo `telefono` es opcional.'
        ),
        request=UsuarioSerializer,
        responses={
            201: UsuarioSerializer,
            400: OpenApiResponse(description='Solicitud inválida (validación)'),
        },
        examples=[
            OpenApiExample(
                'Crear usuario (ejemplo)',
                value={'email': 'cliente@shopsmart.cl', 'nombre': 'Cliente ShopSmart', 'telefono': '+56912345678'},
                request_only=True,
            ),
            OpenApiExample(
                'Usuario creado (ejemplo)',
                value={
                    'id': 1,
                    'email': 'cliente@shopsmart.cl',
                    'nombre': 'Cliente ShopSmart',
                    'telefono': '+56912345678',
                    'creado_en': '2026-03-12T21:00:00Z',
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
