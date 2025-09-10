from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BackupViewSet, BackupScheduleViewSet

router = DefaultRouter()
router.register(r'backups', BackupViewSet)
router.register(r'schedules', BackupScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]