from django.db import models
from plots.models import Plot

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Оплачен'),
        ('not_paid', 'Не оплачен'),
        ('partial', 'Частично оплачен'),
    ]

    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, verbose_name="Участок")
    year = models.IntegerField(verbose_name="Год")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Сумма")
    date_paid = models.DateField(verbose_name="Дата оплаты", null=True, blank=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, 
                            default='not_paid', verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Платеж"
        verbose_name_plural = "Платежи"
        unique_together = ['plot', 'year']
        ordering = ['-year', 'plot__plot_number']

    def __str__(self):
        return f"{self.plot.plot_number} - {self.year} - {self.amount} руб."

    @property
    def is_paid(self):
        return self.status == 'paid'