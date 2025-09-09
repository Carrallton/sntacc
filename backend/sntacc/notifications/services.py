import smtplib
import requests
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from .models import Notification

class NotificationService:
    @staticmethod
    def send_email(notification):
        """Отправка email уведомления"""
        try:
            email = EmailMessage(
                subject=notification.subject,
                body=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[notification.recipient_email],
            )
            email.send()
            notification.status = 'sent'
            notification.sent_at = timezone.now()
            notification.save()
            return True
        except Exception as e:
            notification.status = 'failed'
            notification.save()
            print(f"Ошибка отправки email: {e}")
            return False
    
    @staticmethod
    def send_telegram(notification):
        """Отправка Telegram уведомления"""
        try:
            bot_token = settings.TELEGRAM_BOT_TOKEN
            if not bot_token:
                raise Exception("Telegram bot token не настроен")
            
            # Предполагаем, что recipient_phone содержит chat_id
            chat_id = notification.recipient_phone
            
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': notification.message
            }
            
            response = requests.post(url, data=data, timeout=10)
            if response.status_code == 200:
                notification.status = 'sent'
                notification.sent_at = timezone.now()
                notification.save()
                return True
            else:
                notification.status = 'failed'
                notification.save()
                print(f"Ошибка отправки Telegram: {response.text}")
                return False
        except Exception as e:
            notification.status = 'failed'
            notification.save()
            print(f"Ошибка отправки Telegram: {e}")
            return False
    
    @staticmethod
    def send_notification(notification):
        """Отправка уведомления в зависимости от типа"""
        if notification.template.type == 'email':
            return NotificationService.send_email(notification)
        elif notification.template.type == 'telegram':
            return NotificationService.send_telegram(notification)
        return False