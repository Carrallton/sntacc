# backend/audit/serializers.py
from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()
    timestamp_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_display',
            'action',
            'action_display',
            'model_name',
            'object_id',
            'object_repr',
            'changes',
            'ip_address',
            'user_agent',
            'timestamp',
            'timestamp_display',
            'additional_data'
        ]
    
    def get_user_display(self, obj):
        return obj.user_display
    
    def get_action_display(self, obj):
        return obj.action_display
    
    def get_timestamp_display(self, obj):
        return obj.timestamp.strftime('%d.%m.%Y %H:%M:%S')