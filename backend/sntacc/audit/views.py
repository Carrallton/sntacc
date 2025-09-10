# backend/audit/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q, Count
from .models import AuditLog
from .serializers import AuditLogSerializer
from .services import AuditService

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по параметрам
        user_id = self.request.query_params.get('user_id')
        action = self.request.query_params.get('action')
        model_name = self.request.query_params.get('model_name')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if action:
            queryset = queryset.filter(action=action)
        
        if model_name:
            queryset = queryset.filter(model_name__icontains=model_name)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def recent(self, request):
        """Получение последних записей аудита"""
        limit = int(request.query_params.get('limit', 50))
        logs = AuditService.get_recent_logs(limit)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def user_logs(self, request):
        """Получение логов конкретного пользователя"""
        user_id = request.query_params.get('user_id')
        limit = int(request.query_params.get('limit', 50))
        
        if not user_id:
            return Response({'error': 'Укажите user_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        logs = AuditService.get_user_logs(user_id, limit)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """Статистика по аудиту"""
        # Общее количество записей
        total_logs = AuditLog.objects.count()
        
        # Статистика по действиям
        action_stats = AuditLog.objects.values('action').annotate(
            count=Count('id')  # Исправлено: добавлено Count
        ).order_by('-count')
        
        # Статистика по пользователям
        user_stats = AuditLog.objects.values(
            'user__username', 
            'user__first_name', 
            'user__last_name'
        ).annotate(
            count=Count('id')  # Исправлено: добавлено Count
        ).order_by('-count')[:10]
        
        # Последние 24 часа
        last_24h = timezone.now() - timezone.timedelta(hours=24)
        logs_24h = AuditLog.objects.filter(timestamp__gte=last_24h).count()
        
        return Response({
            'total_logs': total_logs,
            'logs_24h': logs_24h,
            'action_stats': list(action_stats),
            'top_users': list(user_stats)
        })