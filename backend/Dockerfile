FROM python:3.11-slim

# Установка зависимостей системы
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Установка переменных окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Создание рабочей директории
WORKDIR /app

# Копирование requirements
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Сборка статических файлов
RUN python manage.py collectstatic --noinput

# Создание пользователя для запуска приложения
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Открытие порта
EXPOSE 8000

# Команда запуска
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "sntacc.wsgi:application"]