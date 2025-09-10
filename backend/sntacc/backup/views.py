from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse, FileResponse
from django.utils import timezone
from .models import Backup, BackupSchedule
from .serializers import BackupSerializer, BackupScheduleSerializer
from .services import BackupService

class BackupViewSet(viewsets.ModelViewSet):
    queryset = Backup.objects.all()
    serializer_class = BackupSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_backup(self, request):
        """Создание резервной копии через API"""
        try:
            backup_name = request.data.get('name', f'Backup_{timezone.now().strftime("%Y-%m-%d_%H-%M-%S")}')
            backup_type = request.data.get('type', 'full')
            
            backup = BackupService.create_backup(
                backup_name=backup_name,
                backup_type=backup_type,
                user=request.user if request.user.is_authenticated else None
            )
            
            serializer = self.get_serializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def download(self, request, pk=None):
        """Скачивание резервной копии"""
        try:
            backup = self.get_object()
            if backup.status != 'completed':
                return Response({'error': 'Резервная копия еще не завершена'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            if not backup.file_path or not os.path.exists(backup.file_path):
                return Response({'error': 'Файл резервной копии не найден'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            response = FileResponse(
                open(backup.file_path, 'rb'),
                as_attachment=True,
                filename=os.path.basename(backup.file_path)
            )
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def delete_file(self, request, pk=None):
        """Удаление файла резервной копии"""
        try:
            backup = self.get_object()
            if backup.file_path and os.path.exists(backup.file_path):
                os.remove(backup.file_path)
                backup.file_path = ''
                backup.file_size = 0
                backup.save()
            return Response({'message': 'Файл удален'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BackupScheduleViewSet(viewsets.ModelViewSet):
    queryset = BackupSchedule.objects.all()
    serializer_class = BackupScheduleSerializer
    permission_classes = [AllowAny]