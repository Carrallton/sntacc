from django.utils.deprecation import MiddlewareMixin
from .services import AuditService

class AuditMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Логируем важные действия
        if request.user.is_authenticated:
            # Логируем вход в систему (первый запрос после аутентификации)
            if not hasattr(request, '_audit_logged_in'):
                AuditService.log_user_login(request.user, request)
                request._audit_logged_in = True
        
        return None
    
    def process_response(self, request, response):
        # Логируем другие действия при необходимости
        return response