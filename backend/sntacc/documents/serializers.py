from rest_framework import serializers
from .models import Document, DocumentCategory, DocumentTag
from accounts.models import CustomUser
from plots.models import Plot
from owners.models import Owner

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['full_name'] = f"{instance.first_name} {instance.last_name}".strip() or instance.username
        return data

class PlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plot
        fields = ['id', 'plot_number', 'address']

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = ['id', 'full_name', 'phone', 'email']

class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'description', 'created_at']

class DocumentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTag
        fields = ['id', 'name', 'color', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    category = DocumentCategorySerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    related_plot = PlotSerializer(read_only=True)
    related_owner = OwnerSerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    file_icon = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'category', 'document_type', 
            'file', 'file_url', 'file_size', 'file_size_mb', 'file_type',
            'file_extension', 'file_icon', 'status', 'related_plot', 
            'related_owner', 'created_by', 'created_at', 'updated_at', 'tags'
        ]
        read_only_fields = [
            'file_size', 'file_type', 'created_at', 'updated_at', 'created_by'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def get_file_extension(self, obj):
        return obj.get_file_extension()
    
    def get_file_icon(self, obj):
        return obj.get_file_icon()

class DocumentCreateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=DocumentTag.objects.all(), 
        many=True, 
        required=False
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=DocumentCategory.objects.all(), 
        required=False
    )
    related_plot = serializers.PrimaryKeyRelatedField(
        queryset=Plot.objects.all(), 
        required=False
    )
    related_owner = serializers.PrimaryKeyRelatedField(
        queryset=Owner.objects.all(), 
        required=False
    )
    
    class Meta:
        model = Document
        fields = [
            'title', 'description', 'category', 'document_type', 
            'file', 'status', 'related_plot', 'related_owner', 'tags'
        ]
    
    def validate_title(self, value):
        """Валидация заголовка"""
        if not value or not value.strip():
            raise serializers.ValidationError("Заголовок обязателен")
        return value.strip()
    
    def validate_document_type(self, value):
        """Валидация типа документа"""
        if not value:
            return 'other'  # Устанавливаем значение по умолчанию
        return value
    
    def validate_status(self, value):
        """Валидация статуса"""
        if not value:
            return 'active'  # Устанавливаем значение по умолчанию
        return value
    
    def validate_file(self, value):
        """Валидация файла"""
        if not value:
            raise serializers.ValidationError("Файл обязателен")
        
        # Проверяем размер файла (максимум 10MB)
        if hasattr(value, 'size') and value.size > 10 * 1024 * 1024:  # 10MB
            raise serializers.ValidationError("Размер файла не должен превышать 10MB")
        
        return value
    
    def create(self, validated_data):
        """Создание документа"""
        tags_data = validated_data.pop('tags', [])
        
        # Устанавливаем значения по умолчанию если они не указаны
        if 'document_type' not in validated_data:
            validated_data['document_type'] = 'other'
        
        if 'status' not in validated_data:
            validated_data['status'] = 'active'
        
        # Создаем документ
        document = Document.objects.create(**validated_data)
        
        # Добавляем теги
        if tags_data:
            document.tags.set(tags_data)
        
        return document
    
    def update(self, instance, validated_data):
        """Обновление документа"""
        tags_data = validated_data.pop('tags', None)
        
        # Обновляем поля документа
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем теги если они переданы
        if tags_data is not None:
            instance.tags.set(tags_data)
        
        return instance