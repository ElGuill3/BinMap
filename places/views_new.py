# -*- coding: utf-8 -*-
from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import State, Municipality, Category, Place, Favorite
from .serializers import (
    StateSerializer,
    MunicipalitySerializer,
    CategorySerializer,
    PlaceSerializer,
    FavoriteSerializer,
    FavoriteDetailSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission that allows all users to perform read operations,
    but only allows admin users to perform write operations.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user and (request.user.is_staff or request.user.is_superuser)


class StateViewSet(viewsets.ModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class MunicipalityViewSet(viewsets.ModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'state__name']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'municipality__name', 'municipality__id', 'category__name', 'category__id', 'route__name', 'route__id']


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        serializer = FavoriteDetailSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        # Verificar si ya existe un favorito con el mismo lugar y usuario
        place_id = request.data.get('place')
        if place_id:
            existing_favorite = Favorite.objects.filter(
                place_id=place_id,
                user=request.user
            ).first()
            
            # Si ya existe, devolvemos el favorito existente
            if existing_favorite:
                serializer = self.get_serializer(existing_favorite)
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Si no existe, creamos uno nuevo
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        favorite = get_object_or_404(Favorite, id=pk, user=request.user)
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 