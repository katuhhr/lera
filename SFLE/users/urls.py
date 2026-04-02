from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='auth_register'),
    # JWT login by email
    path('token/', views.EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Current user
    path('me/', views.me, name='auth_me'),
]
