from rest_framework.test import APITestCase

from .models import Pedido


class TestPedidosApi(APITestCase):
    def test_get_pedidos(self):
        Pedido.objects.create(cliente='Cliente 1', total='9900.00', estado='creado')

        res = self.client.get('/pedidos/')
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert res.json()[0]['cliente'] == 'Cliente 1'

    def test_post_pedidos(self):
        payload = {'cliente': 'Cliente 2', 'total': '12500.00', 'estado': 'creado'}
        res = self.client.post('/pedidos/', payload, format='json')
        assert res.status_code == 201
        assert res.json()['cliente'] == 'Cliente 2'
