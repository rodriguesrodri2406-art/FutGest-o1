import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  UserPlus, 
  Loader2,
  X,
  Check,
  UserX
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import api from "../services/api";

interface Team {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  teamId: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState(20);
  const [position, setPosition] = useState("Atacante");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        api.get("/jogadores"),
        api.get("/times")
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
      if (teamsRes.data.length > 0) setTeamId(teamsRes.data[0].id);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      toast.error("Selecione um time.");
      return;
    }
    setIsLoading(true);

    try {
      if (editingPlayer) {
        await api.put(`/jogadores/${editingPlayer.id}`, { name, age, position, teamId });
        toast.success("Jogador atualizado!");
      } else {
        await api.post("/jogadores", { name, age, position, teamId });
        toast.success("Jogador cadastrado!");
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error("Erro ao salvar jogador.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setName(player.name);
      setAge(player.age);
      setPosition(player.position);
      setTeamId(player.teamId);
    } else {
      setEditingPlayer(null);
      setName("");
      setAge(20);
      setPosition("Atacante");
      if (teams.length > 0) setTeamId(teams[0].id);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const getTeamName = (id: string) => {
    return teams.find(t => t.id === id)?.name || "N/A";
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Jogadores</h1>
          <p className="text-gray-600">Gerencie os atletas vinculados aos seus times.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Jogador
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.age} anos</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeamName(player.teamId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(player)} className="text-blue-600 hover:text-blue-900 p-2">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum jogador encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingPlayer ? "Editar Jogador" : "Novo Jogador"}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddPlayer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={age} onChange={(e) => setAge(parseInt(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Meio-campo">Meio-campo</option>
                  <option value="Atacante">Atacante</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                  <option value="">Selecione um time</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancelar</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
