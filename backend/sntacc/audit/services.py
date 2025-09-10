import json
from django.utils import timezone
from django.http import HttpRequest
from .models import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        user=None,
        action=None,
        model_name='',
        object_id='',
        object_repr='',
        changes=None,
        request=None,
        additional_data=None
    ):
        """
        Логирование действия пользователя
        """
        try:
            # Получаем IP адрес и User Agent из запроса
            ip_address = None
            user_agent = ''
            
            if request:
                ip_address = AuditService.get_client_ip(request)
                user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]  # Ограничиваем длину
            
            # Создаем запись аудита
            audit_log = AuditLog.objects.create(
                user=user,
                action=action,
                model_name=model_name,
                object_id=str(object_id) if object_id else '',
                object_repr=object_repr[:200],  # Ограничиваем длину
                changes=changes,
                ip_address=ip_address,
                user_agent=user_agent,
                additional_data=additional_data
            )
            
            return audit_log
            
        except Exception as e:
            # Не прерываем основную логику из-за ошибок аудита
            print(f"Ошибка логирования аудита: {e}")
            return None
    
    @staticmethod
    def get_client_ip(request):
        """
        Получение IP адреса клиента
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def log_user_login(user, request=None):
        """
        Логирование входа пользователя
        """
        return AuditService.log_action(
            user=user,
            action='login',
            object_repr=f"Вход пользователя {user.username}",
            request=request
        )
    
    @staticmethod
    def log_user_logout(user, request=None):
        """
        Логирование выхода пользователя
        """
        return AuditService.log_action(
            user=user,
            action='logout',
            object_repr=f"Выход пользователя {user.username}",
            request=request
        )
    
    @staticmethod
    def log_model_create(user, model_name, object_id, object_repr, changes=None, request=None):
        """
        Логирование создания объекта
        """
        return AuditService.log_action(
            user=user,
            action='create',
            model_name=model_name,
            object_id=object_id,
            object_repr=object_repr,
            changes=changes,
            request=request
        )
    
    @staticmethod
    def log_model_update(user, model_name, object_id, object_repr, changes=None, request=None):
        """
        Логирование обновления объекта
        """
        return AuditService.log_action(
            user=user,
            action='update',
            model_name=model_name,
            object_id=object_id,
            object_repr=object_repr,
            changes=changes,
            request=request
        )
    
    @staticmethod
    def log_model_delete(user, model_name, object_id, object_repr, request=None):
        """
        Логирование удаления объекта
        """
        return AuditService.log_action(
            user=user,
            action='delete',
            model_name=model_name,
            object_id=object_id,
            object_repr=object_repr,
            request=request
        )
    
    @staticmethod
    def log_notification_send(user, notification_type, recipient, request=None):
        """
        Логирование отправки уведомления
        """
        return AuditService.log_action(
            user=user,
            action='send_notification',
            model_name=notification_type,
            object_repr=f"Уведомление {notification_type} для {recipient}",
            request=request
        )
    
    @staticmethod
    def log_report_generation(user, report_name, report_type, request=None):
        """
        Логирование генерации отчета
        """
        return AuditService.log_action(
            user=user,
            action='generate_report',
            model_name=report_type,
            object_repr=f"Генерация отчета {report_name}",
            request=request
        )
    
    @staticmethod
    def log_backup_operation(user, operation, backup_name, request=None):
        """
        Логирование операций резервного копирования
        """
        return AuditService.log_action(
            user=user,
            action='backup',
            object_repr=f"{operation} резервной копии {backup_name}",
            request=request
        )
    
    @staticmethod
    def get_user_logs(user, limit=100):
        """
        Получение логов конкретного пользователя
        """
        return AuditLog.objects.filter(user=user).order_by('-timestamp')[:limit]
    
    @staticmethod
    def get_recent_logs(limit=100):
        """
        Получение последних логов
        """
        return AuditLog.objects.all().order_by('-timestamp')[:limit]
    
    @staticmethod
    def get_logs_by_action(action, limit=100):
        """
        Получение логов по типу действия
        """
        return AuditLog.objects.filter(action=action).order_by('-timestamp')[:limit]
    
    @staticmethod
    def get_logs_by_date_range(start_date, end_date):
        """
        Получение логов за период
        """
        return AuditLog.objects.filter(
            timestamp__range=[start_date, end_date]
        ).order_by('-timestamp')