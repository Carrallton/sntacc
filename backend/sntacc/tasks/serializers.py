from rest_framework import serializers
from .models import Task, Reminder
from accounts.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
    
    def to_representation(self, instance):
        # Добавляем full_name в представление
        data = super().to_representation(instance)
        data['full_name'] = f"{instance.first_name} {instance.last_name}".strip() or instance.username
        return data

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), 
        source='assigned_to', 
        write_only=True,
        required=False
    )
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_id', 
            'created_by', 'priority', 'status', 'due_date', 'completed_at',
            'created_at', 'updated_at', 'is_overdue', 'days_until_due'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'completed_at']
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_days_until_due(self, obj):
        return obj.days_until_due()

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'assigned_to', 
            'priority', 'status', 'due_date'
        ]

class ReminderSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'task', 'reminder_type', 'remind_at', 'is_sent', 'created_at'
        ]
        read_only_fields = ['created_at']