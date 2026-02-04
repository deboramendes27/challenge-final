import { useState, useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { RecensementForm } from '@/app/components/RecensementForm';
import { MapRecensement } from '@/app/components/MapRecensement';
import { MobilierList } from '@/app/components/MobilierList';
import { DashboardStats } from '@/app/components/DashboardStats';
import { BureauEditSheet } from '@/app/components/BureauEditSheet';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { LogOut, Map, List as LayoutList, PlusCircle } from 'lucide-react';
import { Mobilier } from '@/app/types/mobilier';
import { findNearbyMobiliers } from '@/app/utils/geolocation';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';

const API_URL = 'http://127.0.0.1:3000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('');
  const [userRole, setUserRole] = useState<'terrain' | 'bureau'>('terrain');
  const [mobiliers, setMobiliers] = useState<Mobilier[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyMobiliers, setNearbyMobiliers] = useState<Mobilier[]>([]);
  
  const [bureauSheetOpen, setBureauSheetOpen] = useState(false);
  const [terrainSheetOpen, setTerrainSheetOpen] = useState(false);
  const [selectedMobilierForEdit, setSelectedMobilierForEdit] = useState<Mobilier | null>(null);

  const carregarDados = async () => {
    try {
      const res = await fetch(`${API_URL}/mobilier`);
      if (res.ok) {
        const dados = await res.json();
        setMobiliers([...dados]);
      }
    } catch (error) { toast.error("Erreur de connexion."); }
  };

  useEffect(() => { if(isLoggedIn) carregarDados(); }, [isLoggedIn]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(newPos);
          if(mobiliers.length > 0) {
             setNearbyMobiliers(findNearbyMobiliers(mobiliers, newPos.lat, newPos.lng, 10));
          }
        },
        (err) => console.error(err), { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isLoggedIn, mobiliers]);

  const handleLogin = (username: string, role: 'terrain' | 'bureau') => {
    setCurrentAgent(username);
    setUserRole(role);
    setIsLoggedIn(true);
    carregarDados();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAgent('');
    setUserRole('terrain');
  };

  const handleSubmitRecensement = async (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => {
    try {
      const res = await fetch(`${API_URL}/mobilier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('Enregistré !');
        setTerrainSheetOpen(false); 
        await carregarDados();
      }
    } catch (e) { toast.error("Erreur d'enregistrement."); }
  };

  const handleUpdate = async (updatedMobilier: Mobilier) => {
    try {
      const res = await fetch(`${API_URL}/mobilier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMobilier)
      });
      if (res.ok) {
        toast.success('Mis à jour !');
        setBureauSheetOpen(false);
        setTerrainSheetOpen(false);
        await carregarDados();
      }
    } catch (e) { toast.error("Erreur de mise à jour."); }
  };

  const handleEditRequest = (mob: Mobilier) => {
    if (userRole === 'bureau') {
      setSelectedMobilierForEdit(mob);
      setBureauSheetOpen(true);
      return;
    }
    if (userRole === 'terrain') {
      const isNearby = nearbyMobiliers.some(m => m.id === mob.id);
      if (isNearby) setTerrainSheetOpen(true);
      else toast.error("Trop loin pour modifier.");
    }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR BUREAU */}
      <BureauEditSheet 
        open={bureauSheetOpen} onOpenChange={setBureauSheetOpen}
        mobilier={selectedMobilierForEdit} onSave={handleUpdate}
      />

      {/* SIDEBAR TERRAIN (Se isso estiver dividindo a tela, o tailwind.config está errado) */}
      <Sheet open={terrainSheetOpen} onOpenChange={setTerrainSheetOpen}>
        <SheetContent side="left" className="w-full max-w-[500px] overflow-y-auto pt-10 z-[1500]"> 
          <SheetHeader className="mb-4">
             <SheetTitle>Formulaire Terrain</SheetTitle>
             <SheetDescription>
                {nearbyMobiliers.length > 0 ? "Modification" : "Nouveau signalement"}
             </SheetDescription>
          </SheetHeader>
          <RecensementForm
            onSubmit={handleSubmitRecensement}
            agent={currentAgent}
            nearbyMobiliers={nearbyMobiliers}
            onUpdateExisting={handleUpdate}
          />
        </SheetContent>
      </Sheet>

      <header className="border-b px-4 py-3 flex items-center justify-between shadow-sm shrink-0 bg-white z-50">
        <div>
          <h1 className="text-xl font-semibold text-indigo-600">
            Recensement MEL <span className="text-xs uppercase px-2 py-0.5 rounded border ml-2">{userRole}</span>
          </h1>
          <p className="text-sm text-gray-600">Agent: {currentAgent}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="size-4 mr-2" /> Déconnexion
        </Button>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden relative isolate">
        <Tabs defaultValue="map" className="flex-1 flex flex-col h-full w-full">
          
          <div className="bg-white border-b px-4 py-2 shrink-0 z-40 relative">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="map"><Map className="size-4 mr-2" /> Carte</TabsTrigger>
              <TabsTrigger value="controle"><LayoutList className="size-4 mr-2" /> Liste</TabsTrigger>
            </TabsList>
          </div>

          {/* MAPA FULL SCREEN */}
          <TabsContent value="map" className="flex-1 w-full h-full p-0 m-0 relative">
             <div className="absolute inset-0 w-full h-full z-10">
                <MapRecensement
                      mobiliers={mobiliers} 
                      currentPosition={currentPosition}
                      nearbyMobiliers={nearbyMobiliers}
                      onMarkerClick={handleEditRequest}
                      userRole={userRole}
                  />
             </div>
              
              {userRole === 'terrain' && (
                <div className="absolute top-4 left-4 z-[500]">
                    <Button onClick={() => setTerrainSheetOpen(true)} className="bg-indigo-600 shadow-xl border-2 border-white text-white">
                        <PlusCircle className="mr-2 size-5" /> Nouveau
                    </Button>
                </div>
              )}

             {userRole === 'bureau' && (
               <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[500] text-xs border border-gray-200">
                 <p className="font-bold mb-2 text-gray-800">Légende (Bureau)</p>
                 <div className="flex items-center gap-2 mb-1"><div className="size-3 rounded-full bg-green-600 border border-green-800"></div> Catégorisé</div>
                 <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-orange-500 border border-orange-700"></div> À Traiter</div>
               </div>
             )}
          </TabsContent>

          <TabsContent value="controle" className="flex-1 m-0 overflow-hidden flex flex-col h-full bg-gray-50 z-20 relative">
            <div className="shrink-0 max-h-[40vh] overflow-y-auto border-b bg-white">
                <DashboardStats mobiliers={mobiliers} />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
               <MobilierList mobiliers={mobiliers} userRole={userRole} onEdit={handleEditRequest} nearbyMobiliers={nearbyMobiliers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}