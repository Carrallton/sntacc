from rest_framework import serializers
from .models import NotificationTemplate, Notification
from plots.models import Plot

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = ['id', 'name', 'type', 'subject', 'body', 'created_at', 'updated_at']

class NotificationSerializer(serializers.ModelSerializer):
    template = NotificationTemplateSerializer(read_only=True)
    plot = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'template', 'plot', 'recipient_email', 'recipient_phone', 
                 'subject', 'message', 'status', 'sent_at', 'created_at']
        read_only_fields = ['created_at', 'sent_at']
    
    def get_plot(self, obj):
        if obj.plot:
            return {
                'id': obj.plot.id,
                'plot_number': obj.plot.plot_number,
                'address': obj.plot.address,
            }
        return None

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['template', 'plot', 'recipient_email', 'recipient_phone', 'subject', 'message']