from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationTemplateViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'templates', NotificationTemplateViewSet)
router.register(r'', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]