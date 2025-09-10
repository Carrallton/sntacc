import os
import json
import pandas as pd
from datetime import datetime
from django.conf import settings
from django.http import HttpResponse
from django.core.paginator import Paginator
from .models import GeneratedReport, ReportTemplate
from plots.models import Plot
from owners.models import Owner
from payments.models import Payment

class ReportService:
    @staticmethod
    def generate_payment_summary(year=None, format='json'):
        """Генерация сводного отчета по платежам"""
        if year is None:
            year = datetime.now().year
            
        # Получаем данные по платежам
        payments = Payment.objects.filter(year=year).select_related('plot__current_owner')
        
        # Статистика по статусам
        stats = {}
        for payment in payments:
            status = payment.status
            if status not in stats:
                stats[status] = {'count': 0, 'amount': 0}
            stats[status]['count'] += 1
            stats[status]['amount'] += float(payment.amount)
        
        # Общая статистика
        total_plots = Plot.objects.count()
        paid_count = stats.get('paid', {}).get('count', 0)
        paid_amount = stats.get('paid', {}).get('amount', 0)
        
        report_data = {
            'year': year,
            'total_plots': total_plots,
            'paid_plots': paid_count,
            'unpaid_plots': total_plots - paid_count,
            'payment_rate': round((paid_count / total_plots * 100), 2) if total_plots > 0 else 0,
            'total_amount': paid_amount,
            'by_status': stats,
            'generated_at': datetime.now().isoformat()
        }
        
        return report_data
    
    @staticmethod
    def generate_debt_report(year=None, format='json'):
        """Генерация отчета по должникам"""
        if year is None:
            year = datetime.now().year
            
        # Получаем неоплаченные платежи
        unpaid_payments = Payment.objects.filter(
            year=year, 
            status__in=['not_paid', 'partial']
        ).select_related('plot__current_owner')
        
        debtors = []
        total_debt = 0
        
        for payment in unpaid_payments:
            owner = payment.plot.current_owner
            if owner:
                debt_amount = float(payment.amount)
                if payment.status == 'partial':
                    # Для частичной оплаты нужно вычесть оплаченную часть
                    # Пока считаем полную сумму как долг
                    pass
                
                debtors.append({
                    'plot_number': payment.plot.plot_number,
                    'owner_name': owner.full_name,
                    'owner_phone': owner.phone,
                    'owner_email': owner.email,
                    'debt_amount': debt_amount,
                    'status': payment.get_status_display()
                })
                total_debt += debt_amount
        
        report_data = {
            'year': year,
            'total_debtors': len(debtors),
            'total_debt': total_debt,
            'debtors': debtors,
            'generated_at': datetime.now().isoformat()
        }
        
        return report_data
    
    @staticmethod
    def generate_financial_report(start_date=None, end_date=None, format='json'):
        """Генерация финансового отчета"""
        if start_date is None:
            start_date = datetime(datetime.now().year, 1, 1)
        if end_date is None:
            end_date = datetime.now()
            
        # Получаем оплаченные платежи за период
        paid_payments = Payment.objects.filter(
            date_paid__range=[start_date, end_date],
            status='paid'
        ).select_related('plot')
        
        monthly_data = {}
        total_income = 0
        
        for payment in paid_payments:
            month_key = payment.date_paid.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {
                    'month': month_key,
                    'count': 0,
                    'amount': 0
                }
            monthly_data[month_key]['count'] += 1
            monthly_data[month_key]['amount'] += float(payment.amount)
            total_income += float(payment.amount)
        
        # Сортируем по месяцам
        sorted_data = sorted(monthly_data.values(), key=lambda x: x['month'])
        
        report_data = {
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'total_income': total_income,
            'monthly_data': sorted_data,
            'generated_at': datetime.now().isoformat()
        }
        
        return report_data
    
    @staticmethod
    def export_to_format(data, format='json'):
        """Экспорт данных в указанный формат"""
        if format == 'json':
            return json.dumps(data, ensure_ascii=False, indent=2)
        elif format == 'csv':
            # Для CSV используем pandas
            if isinstance(data, dict) and 'debtors' in data:
                df = pd.DataFrame(data['debtors'])
                return df.to_csv(index=False)
            elif isinstance(data, dict) and 'monthly_data' in data:
                df = pd.DataFrame(data['monthly_data'])
                return df.to_csv(index=False)
        elif format == 'excel':
            # Для Excel используем pandas
            if isinstance(data, dict) and 'debtors' in data:
                df = pd.DataFrame(data['debtors'])
                return df.to_excel(None, index=False)
        
        return json.dumps(data, ensure_ascii=False, indent=2)
    
    @staticmethod
    def get_report_data(report_type, filters=None):
        """Получение данных для отчета по типу"""
        if filters is None:
            filters = {}
            
        if report_type == 'payment_summary':
            return ReportService.generate_payment_summary(
                year=filters.get('year'),
                format=filters.get('format', 'json')
            )
        elif report_type == 'debt_report':
            return ReportService.generate_debt_report(
                year=filters.get('year'),
                format=filters.get('format', 'json')
            )
        elif report_type == 'financial_report':
            return ReportService.generate_financial_report(
                start_date=filters.get('start_date'),
                end_date=filters.get('end_date'),
                format=filters.get('format', 'json')
            )
        
        return {}