from django.urls import path
<<<<<<< HEAD
from rest_framework_simplejwt.views import TokenRefreshView

=======
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
from . import views

urlpatterns = [
    path('register/', views.register, name='auth_register'),
<<<<<<< HEAD
    # JWT login (в теле можно передать email в поле username)
    path('token/', views.EmailAwareTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
=======
    # JWT login by email
    path('token/', views.EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
    # Current user
    path('me/', views.me, name='auth_me'),
]
