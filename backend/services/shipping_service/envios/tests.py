from rest_framework.test import APITestCase

from .models import Envio


class TestEnviosApi(APITestCase):
    def test_crear_y_actualizar_envio(self):
        res = self.client.post(
            '/envios/crear/',
            {'pedido_id': 1001, 'direccion': 'Av. Siempre Viva 742', 'ciudad': 'Santiago', 'region': 'RM'},
            format='json',
        )
        assert res.status_code == 201
        envio_id = res.json()['id']

        upd = self.client.post(f'/envios/{envio_id}/actualizar/', {'estado': 'enviado', 'tracking': 'TRACK-1'}, format='json')
        assert upd.status_code == 200
        assert upd.json()['estado'] == 'enviado'
        assert upd.json()['tracking'] == 'TRACK-1'

        envio = Envio.objects.get(id=envio_id)
        assert envio.estado == 'enviado'

    def test_listar_envios_por_pedido(self):
        Envio.objects.create(pedido_id=2001, direccion='Dir 1', estado='creado')
        Envio.objects.create(pedido_id=2002, direccion='Dir 2', estado='enviado')

        res = self.client.get('/envios/?pedido_id=2001')
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert len(res.json()) == 1
        assert res.json()[0]['pedido_id'] == 2001

