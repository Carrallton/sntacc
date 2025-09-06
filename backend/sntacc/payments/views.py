from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from plots.models import Plot

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('plot')
    serializer_class = PaymentSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Статистика по платежам"""
        year = request.query_params.get('year', 2024)
        
        stats = Payment.objects.filter(year=year).values('status').annotate(
            count=Count('id')
        )
        
        total_plots = Plot.objects.count()
        paid_count = next((item['count'] for item in stats if item['status'] == 'paid'), 0)
        
        return Response({
            'total_plots': total_plots,
            'paid': paid_count,
            'not_paid': total_plots - paid_count,
            'payment_rate': round((paid_count / total_plots * 100), 2) if total_plots > 0 else 0,
            'by_status': list(stats)
        })

    @action(detail=False, methods=['get'])
    def by_year(self, request):
        """Платежи по годам"""
        year = request.query_params.get('year', 2024)
        payments = Payment.objects.filter(year=year).select_related('plot')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)