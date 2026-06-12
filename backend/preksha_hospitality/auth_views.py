from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        raw = request._request
        user = authenticate(raw, username=username, password=password)
        if user:
            login(raw, user)
            return Response({
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'is_staff': user.is_staff,
                'has_lead_access': user.is_staff or hasattr(user, 'lead_admin_profile'),
                'csrf_token': get_token(raw),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request._request)
        return Response({'message': 'Logged out successfully'})


class CurrentUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'full_name': user.get_full_name(),
            'is_staff': user.is_staff,
            'has_lead_access': user.is_staff or hasattr(user, 'lead_admin_profile'),
            'csrf_token': get_token(request._request),
        })
