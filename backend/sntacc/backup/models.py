from django.db import models
from django.conf import settings

class Backup(models.Model):
    BACKUP_TYPE_CHOICES = [
        ('full', 'Полная копия'),
        ('incremental', 'Инкрементальная копия'),
    ]
    
    BACKUP_STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('processing', 'В процессе'),
        ('completed', 'Завершено'),
        ('failed', 'Ошибка'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Название")
    type = models.CharField(max_length=20, choices=BACKUP_TYPE_CHOICES, default='full', verbose_name="Тип")
    status = models.CharField(max_length=20, choices=BACKUP_STATUS_CHOICES, default='pending', verbose_name="Статус")
    file_path = models.CharField(max_length=500, blank=True, verbose_name="Путь к файлу")
    file_size = models.BigIntegerField(null=True, blank=True, verbose_name="Размер файла (байт)")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Создано")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    
    class Meta:
        verbose_name = "Резервная копия"
        verbose_name_plural = "Резервные копии"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

class BackupSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Ежедневно'),
        ('weekly', 'Еженедельно'),
        ('monthly', 'Ежемесячно'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Название")
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, verbose_name="Частота")
    time = models.TimeField(verbose_name="Время запуска")
    is_active = models.BooleanField(default=True, verbose_name="Активно")
    last_run = models.DateTimeField(null=True, blank=True, verbose_name="Последний запуск")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Расписание резервного копирования"
        verbose_name_plural = "Расписания резервного копирования"
    
    def __str__(self):
        return f"{self.name} ({self.frequency})"