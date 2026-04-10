from rest_framework import viewsets
from .models import Time, Jogador, Campeonato, Partida
from .serializers import TimeSerializer, JogadorSerializer, CampeonatoSerializer, PartidaSerializer

class TimeViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSerializer

    def get_queryset(self):
        return Time.objects.filter(criado_por=self.request.user)

    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)

class JogadorViewSet(viewsets.ModelViewSet):
    queryset = Jogador.objects.all()
    serializer_class = JogadorSerializer

class CampeonatoViewSet(viewsets.ModelViewSet):
    queryset = Campeonato.objects.all()
    serializer_class = CampeonatoSerializer

class PartidaViewSet(viewsets.ModelViewSet):
    queryset = Partida.objects.all()
    serializer_class = PartidaSerializer
