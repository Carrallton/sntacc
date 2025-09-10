from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse, FileResponse
from django.utils import timezone
from .models import ReportTemplate, GeneratedReport
from .serializers import ReportTemplateSerializer, GeneratedReportSerializer
from .services import ReportService

class ReportTemplateViewSet(viewsets.ModelViewSet):
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [AllowAny]

class GeneratedReportViewSet(viewsets.ModelViewSet):
    queryset = GeneratedReport.objects.all().select_related('template', 'generated_by')
    serializer_class = GeneratedReportSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def generate(self, request):
        """Генерация отчета"""
        try:
            template_id = request.data.get('template_id')
            report_name = request.data.get('name')
            report_format = request.data.get('format', 'json')
            filters = request.data.get('filters', {})
            
            template = ReportTemplate.objects.get(id=template_id)
            
            # Создаем запись о генерируемом отчете
            report = GeneratedReport.objects.create(
                template=template,
                name=report_name or f"{template.name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}",
                format=report_format,
                status='processing',
                generated_by=request.user if request.user.is_authenticated else None,
                filters=filters
            )
            
            # Генерируем данные отчета
            report_data = ReportService.get_report_data(template.type, filters)
            
            # Экспортируем в нужный формат
            exported_data = ReportService.export_to_format(report_data, report_format)
            
            # Сохраняем данные (в реальной системе здесь будет сохранение файла)
            report.status = 'completed'
            report.completed_at = timezone.now()
            report.save()
            
            # Для JSON возвращаем данные напрямую
            if report_format == 'json':
                return Response(report_data)
            else:
                # Для других форматов возвращаем ссылку на скачивание
                serializer = self.get_serializer(report)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def download(self, request, pk=None):
        """Скачивание отчета"""
        try:
            report = self.get_object()
            if report.status != 'completed':
                return Response({'error': 'Отчет еще не сгенерирован'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # В реальной системе здесь будет чтение файла
            # Пока возвращаем тестовые данные
            report_data = ReportService.get_report_data(report.template.type, report.filters)
            exported_data = ReportService.export_to_format(report_data, report.format)
            
            if report.format == 'json':
                return Response(report_data)
            elif report.format == 'csv':
                response = HttpResponse(exported_data, content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="{report.name}.csv"'
                return response
            elif report.format == 'excel':
                response = HttpResponse(exported_data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                response['Content-Disposition'] = f'attachment; filename="{report.name}.xlsx"'
                return response
            else:
                response = HttpResponse(exported_data, content_type='application/json')
                response['Content-Disposition'] = f'attachment; filename="{report.name}.json"'
                return response
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def payment_summary(self, request):
        """Сводный отчет по платежам"""
        year = request.query_params.get('year')
        if year:
            year = int(year)
        report_data = ReportService.generate_payment_summary(year)
        return Response(report_data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def debt_report(self, request):
        """Отчет по должникам"""
        year = request.query_params.get('year')
        if year:
            year = int(year)
        report_data = ReportService.generate_debt_report(year)
        return Response(report_data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def financial_report(self, request):
        """Финансовый отчет"""
        report_data = ReportService.generate_financial_report()
        return Response(report_data)