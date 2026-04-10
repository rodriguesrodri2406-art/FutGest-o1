from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimeViewSet, JogadorViewSet, CampeonatoViewSet, PartidaViewSet

router = DefaultRouter()
router.register(r'times', TimeViewSet, basename='time')
router.register(r'jogadores', JogadorViewSet)
router.register(r'campeonatos', CampeonatoViewSet)
router.register(r'partidas', PartidaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
