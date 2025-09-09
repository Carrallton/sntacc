from django.db import models
from django.utils import timezone
from plots.models import Plot

class NotificationTemplate(models.Model):
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('telegram', 'Telegram'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Название")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Тип")
    subject = models.CharField(max_length=255, blank=True, verbose_name="Тема")
    body = models.TextField(verbose_name="Текст сообщения")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Шаблон уведомления"
        verbose_name_plural = "Шаблоны уведомлений"
    
    def __str__(self):
        return self.name

class Notification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('sent', 'Отправлено'),
        ('failed', 'Ошибка'),
    ]
    
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, verbose_name="Шаблон")
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, verbose_name="Участок")
    recipient_email = models.EmailField(blank=True, verbose_name="Email получателя")
    recipient_phone = models.CharField(max_length=20, blank=True, verbose_name="Телефон получателя")
    subject = models.CharField(max_length=255, verbose_name="Тема")
    message = models.TextField(verbose_name="Сообщение")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата отправки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Уведомление"
        verbose_name_plural = "Уведомления"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Уведомление {self.template.name} для {self.plot.plot_number}"