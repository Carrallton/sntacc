from rest_framework import viewsets
from .models import Owner
from .serializers import OwnerSerializer
from rest_framework.permissions import AllowAny


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [AllowAny]