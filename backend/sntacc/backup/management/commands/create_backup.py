from django.core.management.base import BaseCommand
from backup.services import BackupService
from datetime import datetime

class Command(BaseCommand):
    help = 'Создание резервной копии данных'

    def add_arguments(self, parser):
        parser.add_argument(
            '--name',
            type=str,
            help='Название резервной копии',
            default=f'Backup_{datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}'
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['full', 'incremental'],
            default='full',
            help='Тип резервной копии'
        )

    def handle(self, *args, **options):
        try:
            backup = BackupService.create_backup(
                backup_name=options['name'],
                backup_type=options['type']
            )
            self.stdout.write(
                self.style.SUCCESS(f'Резервная копия создана успешно: {backup.name}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Ошибка создания резервной копии: {str(e)}')
            )