from rest_framework import serializers
from .models import Owner

class PlotSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    plot_number = serializers.CharField()
    address = serializers.CharField()
    area = serializers.FloatField()

class PlotOwnerHistorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    plot = PlotSerializer()
    ownership_start = serializers.DateField()
    ownership_end = serializers.DateField(allow_null=True)
    is_current_owner = serializers.BooleanField()

class OwnerSerializer(serializers.ModelSerializer):
    plots_history = PlotOwnerHistorySerializer(source='plotowner_set', many=True, read_only=True)
    
    class Meta:
        model = Owner
        fields = ['id', 'full_name', 'phone', 'email', 'plots_history', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']