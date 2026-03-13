from rest_framework.test import APITestCase

from .models import Cliente, TicketSoporte


class TestCustomerService(APITestCase):
    def test_crear_cliente_eventos_y_recomendaciones(self):
        res = self.client.post(
            '/clientes/',
            {'email': 'cliente@shopsmart.cl', 'nombre': 'Cliente ShopSmart', 'preferencias': {'canal': 'email'}},
            format='json',
        )
        assert res.status_code == 201
        cliente_id = res.json()['id']

        e1 = self.client.post(
            f'/clientes/{cliente_id}/eventos/',
            {'tipo': 'vista', 'sku': 'SKU-123', 'metadata': {'categoria': 'tecnologia'}},
            format='json',
        )
        assert e1.status_code == 201

        e2 = self.client.post(
            f'/clientes/{cliente_id}/eventos/',
            {'tipo': 'compra', 'sku': 'SKU-123', 'metadata': {'categoria': 'tecnologia'}},
            format='json',
        )
        assert e2.status_code == 201

        reco = self.client.get(f'/recomendaciones/?cliente_id={cliente_id}&limit=5')
        assert reco.status_code == 200
        payload = reco.json()
        assert payload['cliente_id'] == cliente_id
        assert isinstance(payload['recomendaciones'], list)
        assert len(payload['recomendaciones']) >= 1

    def test_tickets_y_alertas(self):
        cliente = Cliente.objects.create(email='a@a.com', nombre='A')

        t1 = self.client.post(
            '/tickets/',
            {'cliente_id': cliente.id, 'asunto': 'Problema', 'descripcion': 'Detalle', 'prioridad': 'alta'},
            format='json',
        )
        assert t1.status_code == 201
        t2 = self.client.post(
            '/tickets/',
            {'cliente_id': cliente.id, 'asunto': 'Otro', 'descripcion': 'Detalle', 'prioridad': 'media'},
            format='json',
        )
        assert t2.status_code == 201

        ticket_id = t1.json()['id']
        upd = self.client.post(
            f'/tickets/{ticket_id}/actualizar/',
            {'estado': 'en_progreso', 'asignado_a': 'agente1'},
            format='json',
        )
        assert upd.status_code == 200
        assert upd.json()['estado'] == 'en_progreso'

        assert TicketSoporte.objects.filter(cliente=cliente, estado__in=['abierto', 'en_progreso']).count() == 2

        alertas = self.client.get(f'/clientes/{cliente.id}/alertas/')
        assert alertas.status_code == 200
        assert 'alto_volumen_soporte' in alertas.json()['alertas']

