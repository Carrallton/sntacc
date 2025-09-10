from django.db import models
from django.conf import settings
from django.utils import timezone

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Создание'),
        ('update', 'Обновление'),
        ('delete', 'Удаление'),
        ('login', 'Вход в систему'),
        ('logout', 'Выход из системы'),
        ('view', 'Просмотр'),
        ('export', 'Экспорт'),
        ('import', 'Импорт'),
        ('send_notification', 'Отправка уведомления'),
        ('generate_report', 'Генерация отчета'),
        ('backup', 'Резервное копирование'),
        ('other', 'Другое'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Пользователь"
    )
    action = models.CharField(
        max_length=50, 
        choices=ACTION_CHOICES, 
        verbose_name="Действие"
    )
    model_name = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Модель"
    )
    object_id = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="ID объекта"
    )
    object_repr = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Представление объекта"
    )
    changes = models.JSONField(
        null=True, 
        blank=True, 
        verbose_name="Изменения"
    )
    ip_address = models.GenericIPAddressField(
        null=True, 
        blank=True, 
        verbose_name="IP адрес"
    )
    user_agent = models.TextField(
        blank=True, 
        verbose_name="User Agent"
    )
    timestamp = models.DateTimeField(
        default=timezone.now, 
        verbose_name="Время"
    )
    additional_data = models.JSONField(
        null=True, 
        blank=True, 
        verbose_name="Дополнительные данные"
    )
    
    class Meta:
        verbose_name = "Запись аудита"
        verbose_name_plural = "Записи аудита"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['model_name', '-timestamp']),
        ]
    
    def __str__(self):
        user_str = self.user.username if self.user else 'Аноним'
        return f"{user_str} - {self.get_action_display()} - {self.timestamp}"
    
    @property
    def user_display(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return "Аноним"
    
    @property
    def action_display(self):
        return self.get_action_display()