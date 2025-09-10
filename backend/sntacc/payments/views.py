from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from plots.models import Plot

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Поиск по параметрам
        search = self.request.query_params.get('search', None)
        year = self.request.query_params.get('year', None)
        plot_number = self.request.query_params.get('plot_number', None)
        owner_name = self.request.query_params.get('owner_name', None)
        status = self.request.query_params.get('status', None)
        amount_min = self.request.query_params.get('amount_min', None)
        amount_max = self.request.query_params.get('amount_max', None)
        
        if search:
            queryset = queryset.filter(
                Q(plot__plot_number__icontains=search) |
                Q(plot__address__icontains=search) |
                Q(plot__plotowner__owner__full_name__icontains=search,
                  plot__plotowner__ownership_end__isnull=True)
            )
        
        if year:
            queryset = queryset.filter(year=year)
        
        if plot_number:
            queryset = queryset.filter(plot__plot_number__icontains=plot_number)
        
        if owner_name:
            queryset = queryset.filter(
                plot__plotowner__owner__full_name__icontains=owner_name,
                plot__plotowner__ownership_end__isnull=True
            )
        
        if status:
            queryset = queryset.filter(status=status)
        
        if amount_min:
            queryset = queryset.filter(amount__gte=amount_min)
        
        if amount_max:
            queryset = queryset.filter(amount__lte=amount_max)
        
        return queryset.select_related('plot')  # Добавлен select_related только для plot

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """Статистика по платежам"""
        try:
            year = int(request.query_params.get('year', 2024))
        except (ValueError, TypeError):
            year = 2024
        
        try:
            stats = Payment.objects.filter(year=year).values('status').annotate(
                count=Count('id')
            )
            
            total_plots = Plot.objects.count()
            paid_count = sum(item['count'] for item in stats if item['status'] == 'paid')
            
            return Response({
                'total_plots': total_plots,
                'paid': paid_count,
                'not_paid': max(0, total_plots - paid_count),
                'payment_rate': round((paid_count / total_plots * 100), 2) if total_plots > 0 else 0,
                'by_status': list(stats)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_year(self, request):
        """Платежи по годам"""
        try:
            year = int(request.query_params.get('year', 2024))
        except (ValueError, TypeError):
            year = 2024
            
        queryset = self.get_queryset().filter(year=year)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Поиск платежей"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)