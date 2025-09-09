from rest_framework import serializers
from .models import Plot, PlotOwner

class OwnerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField()

class PlotOwnerSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    
    class Meta:
        model = PlotOwner
        fields = ['id', 'owner', 'ownership_start', 'ownership_end', 'is_current_owner']

class PlotSerializer(serializers.ModelSerializer):
    current_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Plot
        fields = ['id', 'plot_number', 'address', 'area', 'current_owner', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_current_owner(self, obj):
        try:
            owner = obj.current_owner
            if owner:
                return {
                    'id': owner.id,
                    'full_name': owner.full_name,
                    'phone': owner.phone or '',
                    'email': owner.email or ''
                }
        except Exception as e:
            print(f"Ошибка в get_current_owner: {e}")
        return None

class PlotDetailSerializer(PlotSerializer):
    owners_history = PlotOwnerSerializer(source='plotowner_set', many=True, read_only=True)
    
    class Meta(PlotSerializer.Meta):
        fields = PlotSerializer.Meta.fields + ['owners_history']