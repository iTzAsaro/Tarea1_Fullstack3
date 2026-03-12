from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({'ok': True})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('', include('productos.urls')),
]
