from django.db import models
from owners.models import Owner

class Plot(models.Model):
    plot_number = models.CharField(max_length=50, unique=True, verbose_name="Номер участка")
    address = models.TextField(verbose_name="Адрес", blank=True)
    area = models.FloatField(verbose_name="Площадь (в сотках)", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Участок"
        verbose_name_plural = "Участки"
        ordering = ['plot_number']

    def __str__(self):
        return f"Участок {self.plot_number}"

    @property
    def current_owner(self):
        """Получить текущего владельца участка"""
        try:
            plot_owner = self.plotowner_set.filter(
                ownership_end__isnull=True
            ).order_by('-ownership_start').first()
            return plot_owner.owner if plot_owner else None
        except Exception:
            return None

class PlotOwner(models.Model):
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, verbose_name="Участок")
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, verbose_name="Собственник")
    ownership_start = models.DateField(verbose_name="Дата начала владения")
    ownership_end = models.DateField(verbose_name="Дата окончания владения", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Владелец участка"
        verbose_name_plural = "Владельцы участков"
        ordering = ['-ownership_start']

    def __str__(self):
        return f"{self.owner} - {self.plot}"

    @property
    def is_current_owner(self):
        return self.ownership_end is None