from functools import wraps
from .services import AuditService

def audit_log(action, model_name=''):
    """
    Декоратор для логирования действий
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Получаем request из аргументов (если есть)
            request = None
            user = None
            
            # Ищем request и user в аргументах
            for arg in args:
                if hasattr(arg, 'user'):
                    user = arg.user
                    request = arg if hasattr(arg, 'META') else None
                    break
            
            # Выполняем функцию
            result = func(*args, **kwargs)
            
            # Логируем действие
            AuditService.log_action(
                user=user,
                action=action,
                model_name=model_name,
                request=request
            )
            
            return result
        return wrapper
    return decorator