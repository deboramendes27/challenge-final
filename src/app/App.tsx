import { useState, useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { RecensementForm } from '@/app/components/RecensementForm';
import { MapRecensement } from '@/app/components/MapRecensement';
import { MobilierList } from '@/app/components/MobilierList';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { LogOut, Map, List } from 'lucide-react';
import { Mobilier } from '@/app/types/mobilier';
import { findNearbyMobiliers } from '@/app/utils/geolocation';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

// Usa o endereço IP direto para evitar bug do Windows com localhost
const API_URL = 'http://127.0.0.1:3000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [mobiliers, setMobiliers] = useState<Mobilier[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyMobiliers, setNearbyMobiliers] = useState<Mobilier[]>([]);

  // 1. Carregar dados do Backend Real
  const carregarDados = async () => {
    try {
      const res = await fetch(`${API_URL}/mobilier`);
      if (res.ok) {
        const dados = await res.json();
        setMobiliers(dados);
      }
    } catch (error) {
      console.error("Erro API:", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    // Só carrega se estiver logado (ou tenta carregar sempre se preferir)
    if(isLoggedIn) carregarDados();

    // Inicia GPS
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(newPos);
          setNearbyMobiliers(findNearbyMobiliers(mobiliers, newPos.lat, newPos.lng, 10));
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isLoggedIn]);

  // Atualiza proximidade quando a lista muda
  useEffect(() => {
    if (currentPosition && mobiliers.length > 0) {
      setNearbyMobiliers(findNearbyMobiliers(mobiliers, currentPosition.lat, currentPosition.lng, 10));
    }
  }, [mobiliers, currentPosition]);

  const handleLogin = (username: string) => {
    setCurrentAgent(username);
    setIsLoggedIn(true);
    carregarDados();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent('');
  };

  // ENVIA PARA O BACKEND (Node.js)
  const handleSubmitRecensement = async (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => {
    try {
      const res = await fetch(`${API_URL}/mobilier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success('Recenseado com sucesso!');
        carregarDados(); // Recarrega do banco
      } else {
        toast.error("Erro ao salvar.");
      }
    } catch (e) {
      toast.error("Erro de conexão.");
    }
  };

  // ATUALIZA NO BACKEND
  const handleUpdateExisting = async (updatedMobilier: Mobilier) => {
    try {
      const res = await fetch(`${API_URL}/mobilier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMobilier)
      });

      if (res.ok) {
        toast.success('Atualizado com sucesso!');
        carregarDados();
      }
    } catch (e) {
      toast.error("Erro ao atualizar.");
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster />
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-indigo-600">Recensement MEL</h1>
          <p className="text-sm text-gray-600">Agente: {currentAgent}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="size-4 mr-2" />
          Sair
        </Button>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="map" className="h-full flex flex-col">
          <div className="bg-white border-b px-4 py-2 shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="map"><Map className="size-4 mr-2" /> Mapa</TabsTrigger>
              <TabsTrigger value="list"><List className="size-4 mr-2" /> Lista ({mobiliers.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="flex-1 m-0 p-0 overflow-hidden relative h-full">
            <div className="h-full grid grid-cols-1 lg:grid-cols-3">
              <div className="h-[50vh] lg:h-full lg:col-span-2 relative z-0">
                {/* Aqui chamamos o Mapa Real com Leaflet */}
                <MapRecensement
                  mobiliers={mobiliers}
                  currentPosition={currentPosition}
                  nearbyMobiliers={nearbyMobiliers}
                />
              </div>
              <div className="h-[50vh] lg:h-full overflow-y-auto bg-white border-l z-10 shadow-2xl relative">
                <RecensementForm
                  onSubmit={handleSubmitRecensement}
                  agent={currentAgent}
                  nearbyMobiliers={nearbyMobiliers}
                  onUpdateExisting={handleUpdateExisting}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="flex-1 m-0 p-4 overflow-hidden">
            <div className="h-full">
              <MobilierList mobiliers={mobiliers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}