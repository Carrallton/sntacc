from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from plots.views import PlotViewSet
from owners.views import OwnerViewSet
from payments.views import PaymentViewSet

router = DefaultRouter()
router.register(r'plots', PlotViewSet)
router.register(r'owners', OwnerViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]