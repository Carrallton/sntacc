from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport

class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = ['id', 'name', 'type', 'description', 'query_params', 'created_at', 'updated_at']

class GeneratedReportSerializer(serializers.ModelSerializer):
    template_name = serializers.SerializerMethodField()
    generated_by_name = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneratedReport
        fields = ['id', 'template', 'template_name', 'name', 'format', 'status', 
                 'file_path', 'file_size', 'file_size_mb', 'generated_by', 
                 'generated_by_name', 'filters', 'created_at', 'completed_at']
        read_only_fields = ['file_path', 'file_size', 'created_at', 'completed_at']
    
    def get_template_name(self, obj):
        return obj.template.name if obj.template else ''
    
    def get_generated_by_name(self, obj):
        if obj.generated_by:
            return f"{obj.generated_by.first_name} {obj.generated_by.last_name}".strip() or obj.generated_by.username
        return "Система"
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0