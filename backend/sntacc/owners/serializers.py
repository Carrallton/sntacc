from rest_framework import serializers
from .models import Owner
from plots.models import PlotOwner
from plots.serializers import PlotSerializer

class PlotOwnerHistorySerializer(serializers.ModelSerializer):
    plot = PlotSerializer(read_only=True)
    
    class Meta:
        model = PlotOwner
        fields = ['id', 'plot', 'ownership_start', 'ownership_end', 'is_current_owner']

class OwnerSerializer(serializers.ModelSerializer):
    plots_history = PlotOwnerHistorySerializer(source='plotowner_set', many=True, read_only=True)
    
    class Meta:
        model = Owner
        fields = ['id', 'full_name', 'phone', 'email', 'plots_history', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']