from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', views.login, name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('2fa/enable/', views.enable_2fa, name='enable_2fa'),
    path('2fa/verify-enable/', views.verify_and_enable_2fa, name='verify_and_enable_2fa'),
    path('2fa/disable/', views.disable_2fa, name='disable_2fa'),
    path('security-settings/', views.get_security_settings, name='security_settings'),
    path('change-password/', views.change_password, name='change_password'),
    path('register/', views.register, name='register'),
    path('me/', views.current_user, name='current_user'),
    path('me/update/', views.update_profile, name='update_profile'),
    path('invitations/create/', views.create_invitation, name='create_invitation'),
    path('users/', views.list_users, name='list_users'),
    path('users/create/', views.create_user, name='create_user'),
    path('users/<int:user_id>/', views.update_user, name='update_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
]