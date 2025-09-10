from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q
from .models import Task, Reminder
from .serializers import TaskSerializer, TaskCreateSerializer, ReminderSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().select_related('assigned_to', 'created_by')
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по параметрам
        status = self.request.query_params.get('status', None)
        priority = self.request.query_params.get('priority', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        search = self.request.query_params.get('search', None)
        overdue = self.request.query_params.get('overdue', None)
        
        if status:
            queryset = queryset.filter(status=status)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        if overdue == 'true':
            queryset = queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['pending', 'in_progress']
            )
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        # В реальной системе здесь будет self.request.user
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def complete(self, request, pk=None):
        """Завершить задачу"""
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def assign(self, request, pk=None):
        """Назначить задачу пользователю"""
        task = self.get_object()
        user_id = request.data.get('user_id')
        if user_id:
            try:
                from accounts.models import CustomUser
                user = CustomUser.objects.get(id=user_id)
                task.assigned_to = user
                task.save()
                serializer = self.get_serializer(task)
                return Response(serializer.data)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Укажите user_id'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def my_tasks(self, request):
        """Получить задачи, назначенные текущему пользователю"""
        # Для тестирования возвращаем все задачи
        tasks = Task.objects.all().select_related('assigned_to', 'created_by')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def overdue(self, request):
        """Получить просроченные задачи"""
        tasks = Task.objects.filter(
            due_date__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).select_related('assigned_to', 'created_by')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """Статистика по задачам"""
        total = Task.objects.count()
        completed = Task.objects.filter(status='completed').count()
        pending = Task.objects.filter(status='pending').count()
        in_progress = Task.objects.filter(status='in_progress').count()
        overdue = Task.objects.filter(
            due_date__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        ).count()
        
        return Response({
            'total': total,
            'completed': completed,
            'pending': pending,
            'in_progress': in_progress,
            'overdue': overdue,
            'completion_rate': round((completed / total * 100), 2) if total > 0 else 0
        })

class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().select_related('task')
    serializer_class = ReminderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по параметрам
        task_id = self.request.query_params.get('task_id', None)
        reminder_type = self.request.query_params.get('reminder_type', None)
        is_sent = self.request.query_params.get('is_sent', None)
        
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        if reminder_type:
            queryset = queryset.filter(reminder_type=reminder_type)
        
        if is_sent is not None:
            queryset = queryset.filter(is_sent=is_sent.lower() == 'true')
        
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def upcoming(self, request):
        """Получить предстоящие напоминания"""
        reminders = Reminder.objects.filter(
            remind_at__gte=timezone.now(),
            is_sent=False
        ).select_related('task').order_by('remind_at')
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)