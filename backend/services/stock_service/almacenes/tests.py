from rest_framework.test import APITestCase

from .models import Almacen, MovimientoStock, NivelStock


class TestStockService(APITestCase):
    def test_ajuste_stock_crea_nivel_y_evento(self):
        Almacen.objects.create(codigo='SCL-CENTRO', nombre='Bodega Santiago Centro')

        res = self.client.post(
            '/stock/ajustes/',
            {
                'almacen_codigo': 'SCL-CENTRO',
                'sku': 'SKU-123',
                'delta': 5,
                'motivo': 'recepcion',
                'referencia': 'OC-1',
            },
            format='json',
        )
        assert res.status_code == 201

        nivel = NivelStock.objects.get(almacen__codigo='SCL-CENTRO', sku='SKU-123')
        assert nivel.cantidad == 5
        assert MovimientoStock.objects.filter(almacen__codigo='SCL-CENTRO', sku='SKU-123').count() == 1

    def test_disponibilidad_y_eventos_since_id(self):
        Almacen.objects.create(codigo='SCL-CENTRO', nombre='Bodega Santiago Centro')
        Almacen.objects.create(codigo='VLP-01', nombre='Bodega Valparaíso')

        res1 = self.client.post(
            '/stock/ajustes/',
            {'almacen_codigo': 'SCL-CENTRO', 'sku': 'SKU-123', 'delta': 10, 'motivo': 'recepcion'},
            format='json',
        )
        assert res1.status_code == 201
        mov_id_1 = res1.json()['movimiento']['id']

        res2 = self.client.post(
            '/stock/ajustes/',
            {'almacen_codigo': 'VLP-01', 'sku': 'SKU-123', 'delta': 3, 'motivo': 'recepcion'},
            format='json',
        )
        assert res2.status_code == 201

        disp = self.client.get('/stock/disponibilidad/?sku=SKU-123')
        assert disp.status_code == 200
        assert disp.json()['total'] == 13

        eventos = self.client.get(f'/stock/eventos/?since_id={mov_id_1}')
        assert eventos.status_code == 200
        assert isinstance(eventos.json(), list)
        assert len(eventos.json()) == 1

