from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging
from .serializers import DocumentSerializer, DocumentCategorySerializer, DocumentTagSerializer, DocumentCreateSerializer
from .models import Document, DocumentCategory, DocumentTag

logger = logging.getLogger(__name__)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().select_related(
        'category', 'created_by', 'related_plot', 'related_owner'
    ).prefetch_related('tags')
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        """Создание документа с подробным логированием"""
        logger.info(f"Получен запрос на создание документа")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Данные запроса: {request.data}")
        
        try:
            # Проверяем, есть ли файл в запросе
            if 'file' not in request.data:
                logger.warning("Файл не найден в запросе")
                return Response(
                    {'error': 'Файл обязателен для загрузки'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Проверяем, есть ли заголовок файла
            file_obj = request.data.get('file')
            if not file_obj:
                logger.warning("Пустой файл в запросе")
                return Response(
                    {'error': 'Файл не может быть пустым'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Логируем информацию о файле
            logger.info(f"Информация о файле: {type(file_obj)}")
            if hasattr(file_obj, 'name'):
                logger.info(f"Имя файла: {file_obj.name}")
            if hasattr(file_obj, 'size'):
                logger.info(f"Размер файла: {file_obj.size}")
            
            # Создаем сериализатор
            serializer = self.get_serializer(data=request.data)
            logger.info(f"Данные для сериализатора: {serializer.initial_data}")
            
            if serializer.is_valid():
                logger.info("Сериализатор валиден")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                logger.info("Документ успешно создан")
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                logger.error(f"Ошибки валидации сериализатора: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except ValidationError as e:
            logger.error(f"ValidationError при создании документа: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Неожиданная ошибка при создании документа: {str(e)}")
            logger.exception(e)
            return Response({'error': f'Внутренняя ошибка сервера: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return DocumentCreateSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        logger.info("Выполняем сохранение документа")
        serializer.save()
        logger.info("Документ успешно сохранен")

    def create(self, request, *args, **kwargs):
        """Создание документа с обработкой ошибок"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Обновление документа с обработкой ошибок"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def categories(self, request):
        """Получить список категорий документов"""
        categories = DocumentCategory.objects.all()
        serializer = DocumentCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def tags(self, request):
        """Получить список тегов документов"""
        tags = DocumentTag.objects.all()
        serializer = DocumentTagSerializer(tags, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """Статистика по документам"""
        total = Document.objects.count()
        by_category = Document.objects.values(
            'category__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        by_type = Document.objects.values(
            'document_type'
        ).annotate(count=Count('id')).order_by('-count')
        
        by_status = Document.objects.values(
            'status'
        ).annotate(count=Count('id')).order_by('-count')
        
        recent = Document.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
        
        return Response({
            'total': total,
            'recent': recent,
            'by_category': list(by_category),
            'by_type': list(by_type),
            'by_status': list(by_status)
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_plot(self, request):
        """Получить документы по участку"""
        plot_id = request.query_params.get('plot_id', None)
        if not plot_id:
            return Response({'error': 'Укажите plot_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        documents = Document.objects.filter(related_plot_id=plot_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_owner(self, request):
        """Получить документы по собственнику"""
        owner_id = request.query_params.get('owner_id', None)
        if not owner_id:
            return Response({'error': 'Укажите owner_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        documents = Document.objects.filter(related_owner_id=owner_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [AllowAny]

class DocumentTagViewSet(viewsets.ModelViewSet):
    queryset = DocumentTag.objects.all()
    serializer_class = DocumentTagSerializer
    permission_classes = [AllowAny]