from rest_framework import serializers
from .models import Payment
from plots.models import Plot

class PaymentSerializer(serializers.ModelSerializer):
    plot_id = serializers.PrimaryKeyRelatedField(
        queryset=Plot.objects.all(), 
        source='plot', 
        write_only=True
    )
    plot = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'plot', 'plot_id', 'year', 'amount', 'date_paid', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_plot(self, obj):
        if obj.plot:
            return {
                'id': obj.plot.id,
                'plot_number': obj.plot.plot_number,
                'address': obj.plot.address,
                'current_owner': {
                    'id': obj.plot.current_owner.id,
                    'full_name': obj.plot.current_owner.full_name,
                    'phone': obj.plot.current_owner.phone,
                    'email': obj.plot.current_owner.email
                } if obj.plot.current_owner else None
            }
        return None

class PaymentCreateSerializer(serializers.ModelSerializer):
    plot_id = serializers.PrimaryKeyRelatedField(
        queryset=Plot.objects.all(), 
        source='plot', 
        write_only=True
    )
    
    class Meta:
        model = Payment
        fields = ['plot_id', 'year', 'amount', 'date_paid', 'status']
    
    def validate(self, data):
        # Проверяем уникальность (plot, year)
        plot = data['plot']
        year = data['year']
        
        if Payment.objects.filter(plot=plot, year=year).exists():
            raise serializers.ValidationError(f"Платеж за {year} год для участка {plot.plot_number} уже существует")
        
        return data