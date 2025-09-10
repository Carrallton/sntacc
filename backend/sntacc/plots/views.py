from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Plot, PlotOwner
from .serializers import PlotSerializer, PlotDetailSerializer
from owners.models import Owner

class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.all()
    serializer_class = PlotSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Поиск по параметрам
        search = self.request.query_params.get('search', None)
        plot_number = self.request.query_params.get('plot_number', None)
        owner_name = self.request.query_params.get('owner_name', None)
        address = self.request.query_params.get('address', None)
        area_min = self.request.query_params.get('area_min', None)
        area_max = self.request.query_params.get('area_max', None)
        
        if search:
            queryset = queryset.filter(
                Q(plot_number__icontains=search) |
                Q(address__icontains=search)
            )
        
        if plot_number:
            queryset = queryset.filter(plot_number__icontains=plot_number)
        
        if address:
            queryset = queryset.filter(address__icontains=address)
        
        if owner_name:
            queryset = queryset.filter(
                plotowner__owner__full_name__icontains=owner_name,
                plotowner__ownership_end__isnull=True
            ).distinct()
        
        if area_min:
            queryset = queryset.filter(area__gte=area_min)
        
        if area_max:
            queryset = queryset.filter(area__lte=area_max)
        
        return queryset  # Убран select_related('current_owner')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlotDetailSerializer
        return PlotSerializer

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_owner(self, request, pk=None):
        """Добавить владельца участка"""
        plot = self.get_object()
        owner_id = request.data.get('owner_id')
        ownership_start = request.data.get('ownership_start')
        
        if not owner_id or not ownership_start:
            return Response(
                {'error': 'Необходимо указать owner_id и ownership_start'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            owner = Owner.objects.get(id=owner_id)
            # Завершаем предыдущее владение
            PlotOwner.objects.filter(
                plot=plot, 
                ownership_end__isnull=True
            ).update(ownership_end=ownership_start)
            
            # Создаем новое владение
            plot_owner = PlotOwner.objects.create(
                plot=plot,
                owner=owner,
                ownership_start=ownership_start
            )
            
            return Response({'message': 'Владелец успешно добавлен'})
        except Owner.DoesNotExist:
            return Response(
                {'error': 'Собственник не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def unpaid_plots(self, request):
        """Получить список участков с неоплаченными платежами"""
        from payments.models import Payment
        from django.db.models import Q
        
        year = request.query_params.get('year', 2024)
        search = request.query_params.get('search', None)
        
        unpaid_plots = Plot.objects.filter(
            ~Q(payment__year=year, payment__status='paid')
        ).distinct()
        
        # Применяем поиск
        if search:
            unpaid_plots = unpaid_plots.filter(
                Q(plot_number__icontains=search) |
                Q(address__icontains=search) |
                Q(plotowner__owner__full_name__icontains=search,
                  plotowner__ownership_end__isnull=True)
            )
        
        serializer = self.get_serializer(unpaid_plots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Поиск участков"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)