# backend/accounts/models.py - обновим модель пользователя
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

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
    
    # Поля для безопасности
    failed_login_attempts = models.IntegerField(default=0, verbose_name="Неудачные попытки входа")
    last_failed_login = models.DateTimeField(null=True, blank=True, verbose_name="Последняя неудачная попытка")
    is_locked = models.BooleanField(default=False, verbose_name="Заблокирован")
    lockout_time = models.DateTimeField(null=True, blank=True, verbose_name="Время блокировки")
    password_changed_at = models.DateTimeField(null=True, blank=True, verbose_name="Последняя смена пароля")
    two_factor_enabled = models.BooleanField(default=False, verbose_name="Двухфакторная аутентификация")
    two_factor_secret = models.CharField(max_length=100, blank=True, verbose_name="Секретный ключ 2FA")
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
    
    def __str__(self):
        return f"{self.username} ({self.snt.name if self.snt else 'Без СНТ'})"
    
    def is_locked_out(self):
        """Проверка, заблокирован ли пользователь"""
        if not self.is_locked:
            return False
        
        # Проверяем, истекло ли время блокировки (30 минут)
        if self.lockout_time:
            unlock_time = self.lockout_time + timezone.timedelta(minutes=30)
            if timezone.now() > unlock_time:
                # Разблокируем пользователя
                self.is_locked = False
                self.failed_login_attempts = 0
                self.lockout_time = None
                self.save()
                return False
        
        return True
    
    def increment_failed_login(self):
        """Увеличение счетчика неудачных попыток"""
        self.failed_login_attempts += 1
        self.last_failed_login = timezone.now()
        
        # Блокируем после 5 неудачных попыток
        if self.failed_login_attempts >= 5:
            self.is_locked = True
            self.lockout_time = timezone.now()
        
        self.save()
    
    def reset_failed_login(self):
        """Сброс счетчика неудачных попыток"""
        self.failed_login_attempts = 0
        self.last_failed_login = None
        self.is_locked = False
        self.lockout_time = None
        self.save()

class SecuritySettings(models.Model):
    snt = models.OneToOneField(SNT, on_delete=models.CASCADE, verbose_name="СНТ")
    
    # Настройки паролей
    min_password_length = models.IntegerField(default=8, verbose_name="Минимальная длина пароля")
    require_uppercase = models.BooleanField(default=True, verbose_name="Требовать заглавные буквы")
    require_lowercase = models.BooleanField(default=True, verbose_name="Требовать строчные буквы")
    require_numbers = models.BooleanField(default=True, verbose_name="Требовать цифры")
    require_special_chars = models.BooleanField(default=True, verbose_name="Требовать специальные символы")
    password_expiry_days = models.IntegerField(default=90, verbose_name="Срок действия пароля (дней)")
    
    # Настройки входа
    max_failed_attempts = models.IntegerField(default=5, verbose_name="Максимум неудачных попыток")
    lockout_duration = models.IntegerField(default=30, verbose_name="Длительность блокировки (минут)")
    session_timeout = models.IntegerField(default=30, verbose_name="Таймаут сессии (минут)")
    
    # Настройки 2FA
    require_2fa_for_admins = models.BooleanField(default=True, verbose_name="Требовать 2FA для администраторов")
    allow_2fa_for_users = models.BooleanField(default=True, verbose_name="Разрешить 2FA для пользователей")
    
    # Настройки аудита
    log_login_attempts = models.BooleanField(default=True, verbose_name="Логировать попытки входа")
    log_password_changes = models.BooleanField(default=True, verbose_name="Логировать смену паролей")
    log_sensitive_actions = models.BooleanField(default=True, verbose_name="Логировать чувствительные действия")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Настройки безопасности"
        verbose_name_plural = "Настройки безопасности"
    
    def __str__(self):
        return f"Настройки безопасности для {self.snt.name}"

class LoginAttempt(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Пользователь")
    ip_address = models.GenericIPAddressField(verbose_name="IP адрес")
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    success = models.BooleanField(verbose_name="Успешно")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Время")
    failure_reason = models.CharField(max_length=100, blank=True, verbose_name="Причина неудачи")
    
    class Meta:
        verbose_name = "Попытка входа"
        verbose_name_plural = "Попытки входа"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['ip_address', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
    
    def __str__(self):
        user_str = self.user.username if self.user else 'Аноним'
        return f"{user_str} - {self.ip_address} - {'Успешно' if self.success else 'Ошибка'}"
    
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