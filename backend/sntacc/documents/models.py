from django.db import models
from django.conf import settings
from django.utils import timezone
import os

def document_upload_path(instance, filename):
    """Путь для загрузки документов"""
    return f'documents/{instance.category}/{timezone.now().strftime("%Y/%m")}/{filename}'

class DocumentCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название категории")
    description = models.TextField(blank=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Категория документов"
        verbose_name_plural = "Категории документов"
    
    def __str__(self):
        return self.name

class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('receipt', 'Квитанция'),
        ('contract', 'Договор'),
        ('protocol', 'Протокол'),
        ('resolution', 'Решение'),
        ('invoice', 'Счет'),
        ('act', 'Акт'),
        ('other', 'Другое'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('active', 'Активный'),
        ('archived', 'В архиве'),
        ('deleted', 'Удален'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Название документа")
    description = models.TextField(blank=True, verbose_name="Описание")
    category = models.ForeignKey(
        DocumentCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Категория"
    )
    document_type = models.CharField(
        max_length=20, 
        choices=DOCUMENT_TYPE_CHOICES, 
        default='other',
        verbose_name="Тип документа"
    )
    file = models.FileField(
        upload_to=document_upload_path,
        verbose_name="Файл"
    )
    file_size = models.BigIntegerField(null=True, blank=True, verbose_name="Размер файла (байт)")
    file_type = models.CharField(max_length=50, blank=True, verbose_name="Тип файла")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active',
        verbose_name="Статус"
    )
    related_plot = models.ForeignKey(
        'plots.Plot', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Связанный участок"
    )
    related_owner = models.ForeignKey(
        'owners.Owner', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Связанный собственник"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Загружено"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    tags = models.ManyToManyField('DocumentTag', blank=True, verbose_name="Теги")
    
    class Meta:
        verbose_name = "Документ"
        verbose_name_plural = "Документы"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['document_type', '-created_at']),
            models.Index(fields=['related_plot']),
            models.Index(fields=['related_owner']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = self.file.size
        
        if self.file and not self.file_type:
            self.file_type = self.file.name.split('.')[-1].lower()
        
        super().save(*args, **kwargs)
    
    def get_file_extension(self):
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return ''
    
    def get_file_icon(self):
        ext = self.get_file_extension()
        icon_map = {
            '.pdf': 'picture_as_pdf',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.png': 'image',
            '.gif': 'image',
            '.doc': 'description',
            '.docx': 'description',
            '.xls': 'table_chart',
            '.xlsx': 'table_chart',
            '.txt': 'text_snippet',
        }
        return icon_map.get(ext, 'insert_drive_file')

class DocumentTag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Название тега")
    color = models.CharField(max_length=7, default='#007bff', verbose_name="Цвет")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Тег документа"
        verbose_name_plural = "Теги документов"
    
    def __str__(self):
        return self.name