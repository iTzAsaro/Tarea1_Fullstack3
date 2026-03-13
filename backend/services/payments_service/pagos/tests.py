from rest_framework.test import APITestCase

from .models import Pago


class TestPagosApi(APITestCase):
    def test_iniciar_y_confirmar_pago(self):
        res = self.client.post(
            '/pagos/iniciar/',
            {'pedido_id': 1001, 'monto': '19990.00', 'moneda': 'CLP', 'idempotency_key': 'pay-1001-1'},
            format='json',
        )
        assert res.status_code == 201
        pago_id = res.json()['id']

        res_dup = self.client.post(
            '/pagos/iniciar/',
            {'pedido_id': 1001, 'monto': '19990.00', 'moneda': 'CLP', 'idempotency_key': 'pay-1001-1'},
            format='json',
        )
        assert res_dup.status_code == 200
        assert res_dup.json()['id'] == pago_id

        confirmar = self.client.post(f'/pagos/{pago_id}/confirmar/', {'estado': 'autorizado'}, format='json')
        assert confirmar.status_code == 200
        assert confirmar.json()['estado'] == 'autorizado'

        pago = Pago.objects.get(id=pago_id)
        assert pago.estado == 'autorizado'

    def test_listar_pagos_por_pedido(self):
        Pago.objects.create(pedido_id=2001, monto='9900.00', moneda='CLP', estado='pendiente', proveedor='simulado')
        Pago.objects.create(pedido_id=2002, monto='5000.00', moneda='CLP', estado='autorizado', proveedor='simulado')

        res = self.client.get('/pagos/?pedido_id=2001')
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert len(res.json()) == 1
        assert res.json()[0]['pedido_id'] == 2001

