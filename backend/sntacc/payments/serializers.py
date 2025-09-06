from rest_framework import serializers
from .models import Payment
from plots.models import Plot
from plots.serializers import PlotSerializer

class PaymentSerializer(serializers.ModelSerializer):
    plot = PlotSerializer(read_only=True)
    plot_id = serializers.PrimaryKeyRelatedField(
        queryset=Plot.objects.all(), 
        source='plot', 
        write_only=True
    )
    
    class Meta:
        model = Payment
        fields = ['id', 'plot', 'plot_id', 'year', 'amount', 'date_paid', 
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'plot', 'year', 'amount', 'date_paid', 'status']