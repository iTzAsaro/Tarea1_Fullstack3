from rest_framework.test import APITestCase

from .models import Producto


class TestProductosApi(APITestCase):
    def test_get_productos(self):
        Producto.objects.create(sku='SKU-1', nombre='Producto 1', precio='9990.00', stock=5)

        res = self.client.get('/productos/')
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert res.json()[0]['sku'] == 'SKU-1'

    def test_post_productos(self):
        payload = {'sku': 'SKU-2', 'nombre': 'Producto 2', 'precio': '12500.00', 'stock': 3}
        res = self.client.post('/productos/', payload, format='json')
        assert res.status_code == 201
        assert res.json()['sku'] == 'SKU-2'
