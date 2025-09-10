import re
import pyotp
import qrcode
import io
import base64
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import SecuritySettings, LoginAttempt

class SecurityService:
    @staticmethod
    def validate_password_strength(password, user=None, snt=None):
        """
        Проверка сложности пароля
        """
        if not snt:
            # Если СНТ не указано, используем стандартные настройки
            settings = {
                'min_password_length': 8,
                'require_uppercase': True,
                'require_lowercase': True,
                'require_numbers': True,
                'require_special_chars': True,
            }
        else:
            # Получаем настройки безопасности для СНТ
            try:
                security_settings = SecuritySettings.objects.get(snt=snt)
                settings = {
                    'min_password_length': security_settings.min_password_length,
                    'require_uppercase': security_settings.require_uppercase,
                    'require_lowercase': security_settings.require_lowercase,
                    'require_numbers': security_settings.require_numbers,
                    'require_special_chars': security_settings.require_special_chars,
                }
            except SecuritySettings.DoesNotExist:
                settings = {
                    'min_password_length': 8,
                    'require_uppercase': True,
                    'require_lowercase': True,
                    'require_numbers': True,
                    'require_special_chars': True,
                }
        
        errors = []
        
        # Проверка минимальной длины
        if len(password) < settings['min_password_length']:
            errors.append(f'Пароль должен содержать минимум {settings["min_password_length"]} символов')
        
        # Проверка заглавных букв
        if settings['require_uppercase'] and not re.search(r'[A-Z]', password):
            errors.append('Пароль должен содержать хотя бы одну заглавную букву')
        
        # Проверка строчных букв
        if settings['require_lowercase'] and not re.search(r'[a-z]', password):
            errors.append('Пароль должен содержать хотя бы одну строчную букву')
        
        # Проверка цифр
        if settings['require_numbers'] and not re.search(r'\d', password):
            errors.append('Пароль должен содержать хотя бы одну цифру')
        
        # Проверка специальных символов
        if settings['require_special_chars'] and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('Пароль должен содержать хотя бы один специальный символ')
        
        # Проверка на словарные слова и простые последовательности
        if user and user.username.lower() in password.lower():
            errors.append('Пароль не должен содержать имя пользователя')
        
        if 'password' in password.lower() or '123456' in password.lower():
            errors.append('Пароль слишком простой')
        
        if errors:
            raise ValidationError(errors)
        
        return True
    
    @staticmethod
    def generate_2fa_secret():
        """
        Генерация секретного ключа для 2FA
        """
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(secret, username, issuer_name="sntacc"):
        """
        Генерация QR кода для 2FA
        """
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            username,
            issuer_name=issuer_name
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Конвертируем в base64 для передачи в frontend
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
    
    @staticmethod
    def verify_2fa_token(secret, token):
        """
        Проверка 2FA токена
        """
        totp = pyotp.TOTP(secret)
        return totp.verify(token)
    
    @staticmethod
    def log_login_attempt(user, ip_address, user_agent, success, failure_reason=''):
        """
        Логирование попытки входа
        """
        try:
            LoginAttempt.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent[:500],  # Ограничиваем длину
                success=success,
                failure_reason=failure_reason[:100]  # Ограничиваем длину
            )
        except Exception as e:
            print(f"Ошибка логирования попытки входа: {e}")
    
    @staticmethod
    def get_failed_attempts(ip_address, time_window_minutes=30):
        """
        Получение количества неудачных попыток с IP за определенное время
        """
        time_threshold = timezone.now() - timezone.timedelta(minutes=time_window_minutes)
        return LoginAttempt.objects.filter(
            ip_address=ip_address,
            success=False,
            timestamp__gte=time_threshold
        ).count()
    
    @staticmethod
    def is_ip_blocked(ip_address, max_attempts=10, time_window_minutes=30):
        """
        Проверка, заблокирован ли IP адрес
        """
        failed_attempts = SecurityService.get_failed_attempts(ip_address, time_window_minutes)
        return failed_attempts >= max_attempts
    
    @staticmethod
    def get_user_security_settings(user):
        """
        Получение настроек безопасности для пользователя
        """
        if user.snt:
            try:
                return SecuritySettings.objects.get(snt=user.snt)
            except SecuritySettings.DoesNotExist:
                # Создаем стандартные настройки
                return SecuritySettings.objects.create(snt=user.snt)
        return None
    
    @staticmethod
    def check_password_expiry(user):
        """
        Проверка срока действия пароля
        """
        if not user.password_changed_at:
            return False
        
        security_settings = SecurityService.get_user_security_settings(user)
        if not security_settings:
            return False
        
        expiry_date = user.password_changed_at + timezone.timedelta(days=security_settings.password_expiry_days)
        return timezone.now() > expiry_date