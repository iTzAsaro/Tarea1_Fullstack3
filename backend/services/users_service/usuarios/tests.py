from rest_framework.test import APITestCase

from .models import Usuario


class TestUsuariosApi(APITestCase):
    def test_get_usuarios(self):
        Usuario.objects.create(email='a@b.com', nombre='Usuario 1', telefono='123')

        res = self.client.get('/usuarios/')
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert res.json()[0]['email'] == 'a@b.com'

    def test_post_usuarios(self):
        payload = {'email': 'c@d.com', 'nombre': 'Usuario 2', 'telefono': '456'}
        res = self.client.post('/usuarios/', payload, format='json')
        assert res.status_code == 201
        assert res.json()['email'] == 'c@d.com'
