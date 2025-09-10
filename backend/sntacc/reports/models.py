from django.db import models
from django.conf import settings
from django.utils import timezone

class ReportTemplate(models.Model):
    REPORT_TYPE_CHOICES = [
        ('payment_summary', 'Сводный отчет по платежам'),
        ('debt_report', 'Отчет по должникам'),
        ('plot_report', 'Отчет по участкам'),
        ('owner_report', 'Отчет по собственникам'),
        ('financial_report', 'Финансовый отчет'),
        ('custom_report', 'Пользовательский отчет'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Название")
    type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES, verbose_name="Тип отчета")
    description = models.TextField(blank=True, verbose_name="Описание")
    query_params = models.JSONField(default=dict, blank=True, verbose_name="Параметры запроса")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Шаблон отчета"
        verbose_name_plural = "Шаблоны отчетов"
    
    def __str__(self):
        return self.name

class GeneratedReport(models.Model):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'В ожидании'),
        ('processing', 'В процессе'),
        ('completed', 'Завершено'),
        ('failed', 'Ошибка'),
    ]
    
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, verbose_name="Шаблон")
    name = models.CharField(max_length=200, verbose_name="Название")
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='pdf', verbose_name="Формат")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Статус")
    file_path = models.CharField(max_length=500, blank=True, verbose_name="Путь к файлу")
    file_size = models.BigIntegerField(null=True, blank=True, verbose_name="Размер файла (байт)")
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name="Сгенерировано")
    filters = models.JSONField(default=dict, blank=True, verbose_name="Фильтры")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    
    class Meta:
        verbose_name = "Сгенерированный отчет"
        verbose_name_plural = "Сгенерированные отчеты"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"