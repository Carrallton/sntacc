from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Owner
from .serializers import OwnerSerializer

class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Поиск по параметрам
        search = self.request.query_params.get('search', None)
        full_name = self.request.query_params.get('full_name', None)
        phone = self.request.query_params.get('phone', None)
        email = self.request.query_params.get('email', None)
        plot_number = self.request.query_params.get('plot_number', None)
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        
        if full_name:
            queryset = queryset.filter(full_name__icontains=full_name)
        
        if phone:
            queryset = queryset.filter(phone__icontains=phone)
        
        if email:
            queryset = queryset.filter(email__icontains=email)
        
        if plot_number:
            queryset = queryset.filter(plotowner__plot__plot_number__icontains=plot_number).distinct()
        
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Поиск собственников"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)