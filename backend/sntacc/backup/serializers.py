from rest_framework import serializers
from .models import Backup, BackupSchedule

class BackupSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = Backup
        fields = ['id', 'name', 'type', 'status', 'file_path', 'file_size', 
                 'file_size_mb', 'created_by', 'created_by_name', 'created_at', 'completed_at']
        read_only_fields = ['file_path', 'file_size', 'created_at', 'completed_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return "Система"
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0

class BackupScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupSchedule
        fields = ['id', 'name', 'frequency', 'time', 'is_active', 'last_run', 'created_at']