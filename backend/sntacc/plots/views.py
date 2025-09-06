from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import Plot, PlotOwner
from .serializers import PlotSerializer, PlotDetailSerializer
from owners.models import Owner

class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.all().select_related('current_owner')
    serializer_class = PlotSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlotDetailSerializer
        return PlotSerializer

    @action(detail=True, methods=['post'])
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

    @action(detail=False, methods=['get'])
    def unpaid_plots(self, request):
        """Получить список участков с неоплаченными платежами"""
        from payments.models import Payment
        from django.db.models import Q
        
        year = request.query_params.get('year', 2024)
        
        unpaid_plots = Plot.objects.filter(
            ~Q(payment__year=year, payment__status='paid')
        ).distinct()
        
        serializer = self.get_serializer(unpaid_plots, many=True)
        return Response(serializer.data)