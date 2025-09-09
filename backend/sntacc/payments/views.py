from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from plots.models import Plot

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('plot')
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                # Возвращаем полный объект с сериализацией
                payment = serializer.instance
                response_serializer = PaymentSerializer(payment)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                # Возвращаем полный объект с сериализацией
                payment = serializer.instance
                response_serializer = PaymentSerializer(payment)
                return Response(response_serializer.data)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            
        payments = Payment.objects.filter(year=year).select_related('plot')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)