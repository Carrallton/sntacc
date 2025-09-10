from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ReminderViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'reminders', ReminderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]