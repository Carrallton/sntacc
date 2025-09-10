from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentCategoryViewSet, DocumentTagViewSet

router = DefaultRouter()
router.register(r'', DocumentViewSet)
router.register(r'categories', DocumentCategoryViewSet)
router.register(r'tags', DocumentTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]