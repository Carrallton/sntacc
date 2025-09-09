from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import NotificationTemplate, Notification
from .serializers import NotificationTemplateSerializer, NotificationSerializer, NotificationCreateSerializer
from .services import NotificationService
from plots.models import Plot
from datetime import timezone


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [AllowAny]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().select_related('template', 'plot')
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def send_bulk(self, request):
        """Массовая отправка уведомлений"""
        try:
            template_id = request.data.get('template_id')
            plot_ids = request.data.get('plot_ids', [])
            notification_type = request.data.get('type', 'email')
            
            template = get_object_or_404(NotificationTemplate, id=template_id)
            
            notifications = []
            for plot_id in plot_ids:
                try:
                    plot = Plot.objects.get(id=plot_id)
                    owner = plot.current_owner
                    
                    if owner:
                        notification_data = {
                            'template': template,
                            'plot': plot,
                            'subject': template.subject,
                            'message': template.body.format(
                                owner_name=owner.full_name,
                                plot_number=plot.plot_number,
                                year=request.data.get('year', timezone.now().year),
                                amount=request.data.get('amount', '0')
                            )
                        }
                        
                        if notification_type == 'email' and owner.email:
                            notification_data['recipient_email'] = owner.email
                        elif notification_type == 'telegram' and owner.phone:
                            notification_data['recipient_phone'] = owner.phone
                        
                        notification = Notification.objects.create(**notification_data)
                        notifications.append(notification)
                except Plot.DoesNotExist:
                    continue
            
            # Отправляем уведомления
            sent_count = 0
            for notification in notifications:
                if NotificationService.send_notification(notification):
                    sent_count += 1
            
            return Response({
                'message': f'Отправлено {sent_count} из {len(notifications)} уведомлений',
                'total': len(notifications),
                'sent': sent_count
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def send(self, request, pk=None):
        """Отправка конкретного уведомления"""
        notification = self.get_object()
        success = NotificationService.send_notification(notification)
        
        if success:
            return Response({'message': 'Уведомление отправлено'})
        else:
            return Response({'error': 'Ошибка отправки уведомления'}, status=status.HTTP_400_BAD_REQUEST)