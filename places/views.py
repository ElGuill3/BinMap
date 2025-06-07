from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Favorite
from .serializers import FavoriteSerializer, FavoriteDetailSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUserOrReadOnly
from rest_framework.filters import SearchFilter

User = get_user_model()

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

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'municipality__name', 'municipality__id', 'category__name', 'category__id', 'route__name', 'route__id']

    def update(self, request, *args, **kwargs):
        # Permitir que los usuarios autenticados actualicen solo los campos is_visited y visited_date
        if not request.user.is_staff and not request.user.is_superuser:
            # Si no es admin, solo permitir actualizar ciertos campos
            allowed_fields = ['is_visited', 'visited_date']
            data = {}
            for field in allowed_fields:
                if field in request.data:
                    data[field] = request.data[field]
            
            if not data:  # Si no hay campos permitidos, denegar acceso
                return Response(
                    {"detail": "You do not have permission to modify these fields."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Actualizar solo con los campos permitidos
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        
        # Si es admin, proceder normalmente
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Aplicar la misma lógica que en update
        return self.update(request, *args, **kwargs) 