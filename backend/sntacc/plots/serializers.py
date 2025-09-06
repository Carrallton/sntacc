from rest_framework import serializers
from .models import Plot, PlotOwner
from owners.models import Owner

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = ['id', 'full_name', 'phone', 'email']

class PlotOwnerSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    
    class Meta:
        model = PlotOwner
        fields = ['id', 'owner', 'ownership_start', 'ownership_end', 'is_current_owner']

class PlotSerializer(serializers.ModelSerializer):
    current_owner = OwnerSerializer(read_only=True)
    
    class Meta:
        model = Plot
        fields = ['id', 'plot_number', 'address', 'area', 'current_owner', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PlotDetailSerializer(PlotSerializer):
    owners_history = PlotOwnerSerializer(source='plotowner_set', many=True, read_only=True)
    
    class Meta(PlotSerializer.Meta):
        fields = PlotSerializer.Meta.fields + ['owners_history']