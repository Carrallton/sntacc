from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import uuid
from .serializers import UserSerializer, UserCreateSerializer, CustomTokenObtainPairSerializer, InvitationCreateSerializer
from .models import Invitation, SNT

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Пользователь успешно зарегистрирован',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Пароль успешно изменен'})

# Админские функции
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invitation(request):
    # Проверяем права доступа
    if request.user.role not in ['admin', 'chairman']:
        return Response({'error': 'Недостаточно прав'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = InvitationCreateSerializer(data=request.data)
    if serializer.is_valid():
        invitation = serializer.save()
        
        # Отправляем email с приглашением
        if invitation.email:
            send_invitation_email(invitation)
        
        return Response({
            'message': 'Приглашение создано',
            'invitation_token': invitation.token
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def send_invitation_email(invitation):
    subject = f"Приглашение в СНТ {invitation.snt.name}"
    message = f"""
    Здравствуйте!
    
    Вы были приглашены в систему учета СНТ "{invitation.snt.name}".
    
    Для регистрации перейдите по ссылке:
    http://localhost:3000/register?token={invitation.token}
    
    Приглашение действительно в течение 7 дней.
    
    С уважением,
    Администрация СНТ
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [invitation.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Ошибка отправки email: {e}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Получить список пользователей текущего СНТ"""
    # Пока показываем всех пользователей (позже фильтруем по СНТ)
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