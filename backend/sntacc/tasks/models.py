from django.db import models
from django.conf import settings
from django.utils import timezone

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('urgent', 'Срочный'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('in_progress', 'В работе'),
        ('completed', 'Завершено'),
        ('cancelled', 'Отменено'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Заголовок")
    description = models.TextField(blank=True, verbose_name="Описание")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks',
        verbose_name="Назначено"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_tasks',
        verbose_name="Создано"
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name="Приоритет"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Статус"
    )
    due_date = models.DateTimeField(null=True, blank=True, verbose_name="Срок выполнения")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def is_overdue(self):
        if self.due_date and self.status != 'completed':
            return timezone.now() > self.due_date
        return False
    
    def days_until_due(self):
        if self.due_date:
            delta = self.due_date - timezone.now()
            return delta.days
        return None

class Reminder(models.Model):
    REMINDER_TYPE_CHOICES = [
        ('email', 'Email'),
        ('notification', 'Уведомление в системе'),
        ('sms', 'SMS'),
    ]
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задача")
    reminder_type = models.CharField(
        max_length=20, 
        choices=REMINDER_TYPE_CHOICES, 
        default='notification',
        verbose_name="Тип напоминания"
    )
    remind_at = models.DateTimeField(verbose_name="Время напоминания")
    is_sent = models.BooleanField(default=False, verbose_name="Отправлено")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        verbose_name = "Напоминание"
        verbose_name_plural = "Напоминания"
        ordering = ['-remind_at']
    
    def __str__(self):
        return f"Напоминание для задачи {self.task.title}"