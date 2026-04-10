from django.db import models
from django.conf import settings

class Time(models.Model):
    nome = models.CharField(max_length=255)
    cidade = models.CharField(max_length=255)
    criado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome

class Jogador(models.Model):
    nome = models.CharField(max_length=255)
    idade = models.IntegerField()
    posicao = models.CharField(max_length=50)
    time = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='jogadores')

    def __str__(self):
        return self.nome

class Campeonato(models.Model):
    nome = models.CharField(max_length=255)
    ano = models.IntegerField()

    def __str__(self):
        return self.nome

class Partida(models.Model):
    time_casa = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='partidas_casa')
    time_fora = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='partidas_fora')
    gols_casa = models.IntegerField(default=0)
    gols_fora = models.IntegerField(default=0)
    data = models.DateTimeField()

    def __str__(self):
        return f"{self.time_casa} {self.gols_casa} x {self.gols_fora} {self.time_fora}"
