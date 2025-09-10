from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from .serializers import UserSerializer, UserCreateSerializer, CustomTokenObtainPairSerializer
from .models import SNT, SecuritySettings, Invitation
from .security import SecurityService
import uuid

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Регистрация пользователя по приглашению"""
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Безопасный вход в систему
    """
    username = request.data.get('username')
    password = request.data.get('password')
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    if not username or not password:
        return Response({'error': 'Укажите имя пользователя и пароль'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Проверяем, заблокирован ли IP
    if SecurityService.is_ip_blocked(ip_address):
        SecurityService.log_login_attempt(None, ip_address, user_agent, False, 'IP заблокирован')
        return Response({'error': 'IP адрес заблокирован'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(username=username)
        
        # Проверяем, заблокирован ли пользователь
        if user.is_locked_out():
            SecurityService.log_login_attempt(user, ip_address, user_agent, False, 'Пользователь заблокирован')
            return Response({'error': 'Пользователь заблокирован'}, status=status.HTTP_403_FORBIDDEN)
        
        # Аутентификация
        if authenticate(username=username, password=password):
            # Сброс счетчика неудачных попыток
            user.reset_failed_login()
            
            # Логируем успешный вход
            SecurityService.log_login_attempt(user, ip_address, user_agent, True)
            
            # Проверяем срок действия пароля
            if SecurityService.check_password_expiry(user):
                return Response({
                    'warning': 'Срок действия пароля истек',
                    'user': UserSerializer(user).data,
                    'change_password_required': True
                })
            
            # Если требуется 2FA
            if user.two_factor_enabled:
                return Response({
                    'message': 'Требуется двухфакторная аутентификация',
                    'user_id': user.id,
                    'two_factor_required': True
                })
            
            # Обычная аутентификация
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        
        else:
            # Неудачная попытка входа
            user.increment_failed_login()
            SecurityService.log_login_attempt(user, ip_address, user_agent, False, 'Неверный пароль')
            return Response({'error': 'Неверное имя пользователя или пароль'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except User.DoesNotExist:
        SecurityService.log_login_attempt(None, ip_address, user_agent, False, 'Пользователь не найден')
        return Response({'error': 'Неверное имя пользователя или пароль'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    """
    Проверка 2FA токена
    """
    user_id = request.data.get('user_id')
    token = request.data.get('token')
    
    try:
        user = User.objects.get(id=user_id)
        
        if not user.two_factor_enabled:
            return Response({'error': '2FA не включена для этого пользователя'}, status=status.HTTP_400_BAD_REQUEST)
        
        if SecurityService.verify_2fa_token(user.two_factor_secret, token):
            # Создаем JWT токены
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        else:
            return Response({'error': 'Неверный код 2FA'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    """
    Включение 2FA для пользователя
    """
    user = request.user
    
    if not user.two_factor_secret:
        # Генерируем секретный ключ
        secret = SecurityService.generate_2fa_secret()
        user.two_factor_secret = secret
        user.save()
    else:
        secret = user.two_factor_secret
    
    # Генерируем QR код
    qr_code = SecurityService.generate_qr_code(secret, user.username)
    
    return Response({
        'secret': secret,
        'qr_code': qr_code,
        'message': 'Отсканируйте QR код в вашем приложении 2FA'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_and_enable_2fa(request):
    """
    Проверка и включение 2FA
    """
    user = request.user
    token = request.data.get('token')
    
    if not user.two_factor_secret:
        return Response({'error': 'Сначала сгенерируйте секретный ключ'}, status=status.HTTP_400_BAD_REQUEST)
    
    if SecurityService.verify_2fa_token(user.two_factor_secret, token):
        user.two_factor_enabled = True
        user.save()
        return Response({'message': 'Двухфакторная аутентификация включена'})
    else:
        return Response({'error': 'Неверный код подтверждения'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """
    Отключение 2FA для пользователя
    """
    user = request.user
    user.two_factor_enabled = False
    user.two_factor_secret = ''
    user.save()
    return Response({'message': 'Двухфакторная аутентификация отключена'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_security_settings(request):
    """
    Получение настроек безопасности пользователя
    """
    security_settings = SecurityService.get_user_security_settings(request.user)
    
    if security_settings:
        return Response({
            'min_password_length': security_settings.min_password_length,
            'require_uppercase': security_settings.require_uppercase,
            'require_lowercase': security_settings.require_lowercase,
            'require_numbers': security_settings.require_numbers,
            'require_special_chars': security_settings.require_special_chars,
            'password_expiry_days': security_settings.password_expiry_days,
            'two_factor_enabled': request.user.two_factor_enabled,
            'password_changed_at': request.user.password_changed_at
        })
    else:
        return Response({
            'min_password_length': 8,
            'require_uppercase': True,
            'require_lowercase': True,
            'require_numbers': True,
            'require_special_chars': True,
            'password_expiry_days': 90,
            'two_factor_enabled': request.user.two_factor_enabled,
            'password_changed_at': request.user.password_changed_at
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Безопасная смена пароля
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({'error': 'Новые пароли не совпадают'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Проверяем сложность нового пароля
        SecurityService.validate_password_strength(new_password, user, user.snt)
        
        # Устанавливаем новый пароль
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()
        
        return Response({'message': 'Пароль успешно изменен'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Получить список пользователей текущего СНТ"""
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """Создать пользователя (админ функция)"""
    if request.user.role not in ['admin', 'chairman']:
        return Response({'error': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """Обновить пользователя"""
    if request.user.role not in ['admin', 'chairman'] and request.user.id != user_id:
        return Response({'error': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Удалить пользователя"""
    if request.user.role not in ['admin', 'chairman']:
        return Response({'error': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.user.id == user_id:
        return Response({'error': 'Нельзя удалить самого себя'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'Пользователь удален'})
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invitation(request):
    """Создание приглашения"""
    if request.user.role not in ['admin', 'chairman']:
        return Response({'error': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
    
    email = request.data.get('email')
    phone = request.data.get('phone')
    snt_id = request.data.get('snt')
    
    if not email and not phone:
        return Response({'error': 'Укажите email или телефон'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        snt = SNT.objects.get(id=snt_id) if snt_id else request.user.snt
        
        invitation = Invitation.objects.create(
            snt=snt,
            email=email or '',
            phone=phone or '',
            token=str(uuid.uuid4()),
            expires_at=timezone.now() + timezone.timedelta(days=7)
        )
        
        return Response({
            'message': 'Приглашение создано',
            'invitation_token': invitation.token
        })
    except SNT.DoesNotExist:
        return Response({'error': 'СНТ не найдено'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)