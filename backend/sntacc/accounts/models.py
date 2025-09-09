from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import timezone

class SNT(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название СНТ")
    address = models.TextField(verbose_name="Адрес", blank=True)
    inn = models.CharField(max_length=12, verbose_name="ИНН", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "СНТ"
        verbose_name_plural = "СНТ"
    
    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Администратор'),
        ('accountant', 'Бухгалтер'),
        ('chairman', 'Председатель'),
        ('user', 'Пользователь'),
    ]
    
    snt = models.ForeignKey(SNT, on_delete=models.CASCADE, verbose_name="СНТ", null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True, verbose_name="Телефон")
    email_verified = models.BooleanField(default=False, verbose_name="Email подтвержден")
    phone_verified = models.BooleanField(default=False, verbose_name="Телефон подтвержден")
    invitation_token = models.CharField(max_length=100, blank=True, verbose_name="Токен приглашения")
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
    
    def __str__(self):
        return f"{self.username} ({self.snt.name if self.snt else 'Без СНТ'})"
    
class Invitation(models.Model):
    INVITATION_TYPE_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
    ]
    
    snt = models.ForeignKey(SNT, on_delete=models.CASCADE, verbose_name="СНТ")
    email = models.EmailField(verbose_name="Email", blank=True)
    phone = models.CharField(max_length=20, verbose_name="Телефон", blank=True)
    token = models.CharField(max_length=100, unique=True, verbose_name="Токен")
    used = models.BooleanField(default=False, verbose_name="Использован")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(verbose_name="Срок действия")
    
    class Meta:
        verbose_name = "Приглашение"
        verbose_name_plural = "Приглашения"
    
    def __str__(self):
        return f"Приглашение для {self.email or self.phone}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at