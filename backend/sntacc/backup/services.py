import os
import shutil
import zipfile
import json
from datetime import datetime
from django.conf import settings
from django.core import management
from django.core.management.base import CommandError
from .models import Backup

class BackupService:
    @staticmethod
    def create_backup(backup_name, backup_type='full', user=None):
        """Создание резервной копии"""
        try:
            # Создаем запись о резервной копии
            backup = Backup.objects.create(
                name=backup_name,
                type=backup_type,
                created_by=user,
                status='processing'
            )
            
            # Создаем директорию для бэкапов если не существует
            backup_dir = os.path.join(settings.BASE_DIR, 'backups')
            os.makedirs(backup_dir, exist_ok=True)
            
            # Генерируем имя файла
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"backup_{timestamp}.zip"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            # Создаем временные файлы дампа базы данных
            db_dump_path = os.path.join(backup_dir, f'db_dump_{timestamp}.sql')
            
            try:
                # Создаем дамп базы данных
                with open(db_dump_path, 'w') as f:
                    management.call_command('dumpdata', stdout=f, indent=2)
                
                # Создаем ZIP архив
                with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    # Добавляем дамп базы данных
                    zipf.write(db_dump_path, 'database.sql')
                    
                    # Добавляем медиа файлы (если есть)
                    media_dir = settings.MEDIA_ROOT
                    if os.path.exists(media_dir):
                        for root, dirs, files in os.walk(media_dir):
                            for file in files:
                                file_path = os.path.join(root, file)
                                arc_path = os.path.relpath(file_path, settings.MEDIA_ROOT)
                                zipf.write(file_path, f'media/{arc_path}')
                
                # Обновляем информацию о бэкапе
                backup.file_path = backup_path
                backup.file_size = os.path.getsize(backup_path)
                backup.status = 'completed'
                backup.completed_at = datetime.now()
                backup.save()
                
                # Удаляем временный файл дампа
                if os.path.exists(db_dump_path):
                    os.remove(db_dump_path)
                
                return backup
                
            except Exception as e:
                backup.status = 'failed'
                backup.completed_at = datetime.now()
                backup.save()
                
                # Удаляем временные файлы при ошибке
                if os.path.exists(db_dump_path):
                    os.remove(db_dump_path)
                if os.path.exists(backup_path):
                    os.remove(backup_path)
                
                raise e
                
        except Exception as e:
            raise Exception(f"Ошибка создания резервной копии: {str(e)}")
    
    @staticmethod
    def restore_backup(backup_id):
        """Восстановление из резервной копии"""
        try:
            backup = Backup.objects.get(id=backup_id)
            if backup.status != 'completed':
                raise Exception("Резервная копия не завершена")
            
            if not os.path.exists(backup.file_path):
                raise Exception("Файл резервной копии не найден")
            
            # Распаковываем архив
            extract_dir = os.path.join(settings.BASE_DIR, 'temp_restore')
            os.makedirs(extract_dir, exist_ok=True)
            
            with zipfile.ZipFile(backup.file_path, 'r') as zipf:
                zipf.extractall(extract_dir)
            
            # Восстанавливаем базу данных
            db_dump_path = os.path.join(extract_dir, 'database.sql')
            if os.path.exists(db_dump_path):
                # Очищаем текущую базу данных
                management.call_command('flush', interactive=False)
                
                # Загружаем данные
                with open(db_dump_path, 'r') as f:
                    management.call_command('loaddata', db_dump_path)
            
            # Восстанавливаем медиа файлы
            media_backup_dir = os.path.join(extract_dir, 'media')
            if os.path.exists(media_backup_dir):
                media_dir = settings.MEDIA_ROOT
                if os.path.exists(media_dir):
                    shutil.rmtree(media_dir)
                shutil.copytree(media_backup_dir, media_dir)
            
            # Удаляем временные файлы
            shutil.rmtree(extract_dir)
            
            return True
            
        except Exception as e:
            raise Exception(f"Ошибка восстановления из резервной копии: {str(e)}")
    
    @staticmethod
    def list_backups():
        """Получение списка резервных копий"""
        return Backup.objects.all().order_by('-created_at')
    
    @staticmethod
    def delete_backup(backup_id):
        """Удаление резервной копии"""
        try:
            backup = Backup.objects.get(id=backup_id)
            
            # Удаляем файл резервной копии
            if backup.file_path and os.path.exists(backup.file_path):
                os.remove(backup.file_path)
            
            # Удаляем запись из базы данных
            backup.delete()
            
            return True
        except Exception as e:
            raise Exception(f"Ошибка удаления резервной копии: {str(e)}")