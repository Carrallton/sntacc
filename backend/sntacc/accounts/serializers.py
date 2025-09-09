from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import SNT, Invitation

User = get_user_model()

class SNTSerializer(serializers.ModelSerializer):
    class Meta:
        model = SNT
        fields = ['id', 'name', 'address']

class UserSerializer(serializers.ModelSerializer):
    snt = SNTSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'snt', 'email_verified', 'phone_verified']
        read_only_fields = ['id', 'email_verified', 'phone_verified']

class UserCreateSerializer(serializers.ModelSerializer):
    invitation_token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'invitation_token']
    
    def validate_invitation_token(self, token):
        try:
            invitation = Invitation.objects.get(token=token)
            if invitation.used:
                raise serializers.ValidationError("Приглашение уже использовано")
            if invitation.is_expired():
                raise serializers.ValidationError("Приглашение истекло")
            return invitation
        except Invitation.DoesNotExist:
            raise serializers.ValidationError("Неверный токен приглашения")
    
    def create(self, validated_data):
        invitation = validated_data.pop('invitation_token')
        password = validated_data.pop('password')
        
        user = User.objects.create(
            snt=invitation.snt,
            email=invitation.email,
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        # Помечаем приглашение как использованное
        invitation.used = True
        invitation.save()
        
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['snt_id'] = user.snt.id if user.snt else None
        return token

class InvitationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ['email', 'phone', 'snt']
    
    def create(self, validated_data):
        import uuid
        validated_data['token'] = str(uuid.uuid4())
        validated_data['expires_at'] = timezone.now() + timezone.timedelta(days=7)
        return super().create(validated_data)