from django.test import SimpleTestCase
from django.urls import reverse


class RoutingTests(SimpleTestCase):
    def test_home_redirects_to_teacher_schedule(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('main:teacher_schedule'))

    def test_pages_require_authentication(self):
        protected_urls = [
            reverse('main:teacher_schedule'),
            reverse('main:teacher_materials'),
            reverse('main:teacher_grades'),
            reverse('main:teacher_selfstudy'),
        ]

        for url in protected_urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 302)
            self.assertIn('/admin/login/', response.url)
