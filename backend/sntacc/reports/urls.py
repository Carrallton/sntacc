from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportTemplateViewSet, GeneratedReportViewSet

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet)
router.register(r'', GeneratedReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]