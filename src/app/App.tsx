import { useState, useEffect } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { ProfilePage } from '@/app/components/ProfilePage';
import { RecensementForm } from '@/app/components/RecensementForm';
import { MapRecensement } from '@/app/components/MapRecensement';
import { MobilierList } from '@/app/components/MobilierList';
import { DashboardStats } from '@/app/components/DashboardStats';
import { BureauEditSheet } from '@/app/components/BureauEditSheet';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { LogOut, Map, BarChart3, User as UserIcon, PlusCircle } from 'lucide-react';
import { Mobilier, User } from '@/app/types/mobilier';
import { findNearbyMobiliers } from '@/app/utils/geolocation';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { Badge } from '@/app/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';

const API_URL = 'http://127.0.0.1:3000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobiliers, setMobiliers] = useState<Mobilier[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyMobiliers, setNearbyMobiliers] = useState<Mobilier[]>([]);
  
  const [isBureauEditOpen, setIsBureauEditOpen] = useState(false);
  const [selectedMobilierForEdit, setSelectedMobilierForEdit] = useState<Mobilier | null>(null);
  const [terrainSheetOpen, setTerrainSheetOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mobiliers');
    if (saved) { try { setMobiliers(JSON.parse(saved)); } catch (e) {} } 
    else { carregarDadosAPI(); }
  }, []);

  const carregarDadosAPI = async () => {
    try {
        const res = await fetch(`${API_URL}/mobilier`);
        if (res.ok) setMobiliers(await res.json());
    } catch (e) { }
  };

  useEffect(() => {
    if (mobiliers.length > 0) localStorage.setItem('mobiliers', JSON.stringify(mobiliers));
  }, [mobiliers]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentPosition(newPos);
          if (mobiliers.length > 0) setNearbyMobiliers(findNearbyMobiliers(mobiliers, newPos.lat, newPos.lng, 15));
        },
        () => setCurrentPosition({ lat: 50.6292, lng: 3.0573 }),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else { setCurrentPosition({ lat: 50.6292, lng: 3.0573 }); }
  }, [mobiliers]);

  const handleLogin = (user: User) => { setCurrentUser(user); setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setCurrentUser(null); };

  const handleSubmitRecensement = (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => {
    const newMob: Mobilier = { ...data, id: `mob-${Date.now()}`, dateRecensement: new Date().toISOString(), agent: currentUser?.username || 'Inconnu' };
    setMobiliers(p => [...p, newMob]);
    toast.success('Enregistré !');
    setTerrainSheetOpen(false);
  };

  const handleUpdateExisting = (updated: Mobilier) => {
    setMobiliers(p => p.map(m => m.id === updated.id ? { ...updated, dateRecensement: new Date().toISOString() } : m));
    toast.success('Mis à jour !');
    setIsBureauEditOpen(false); setTerrainSheetOpen(false);
  };

  // --- NOVA FUNÇÃO DE EXCLUSÃO ---
  const handleDeleteMobilier = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet élément ?")) {
      setMobiliers(prev => prev.filter(m => m.id !== id));
      toast.success("Élément supprimé avec succès !");
      setIsBureauEditOpen(false); // Fecha a janela
    }
  };

  const handleMobilierClick = (mob: Mobilier) => {
    if (currentUser?.role === 'agent-bureau') { setSelectedMobilierForEdit(mob); setIsBureauEditOpen(true); } 
    else if (currentUser?.role === 'agent-terrain') {
       if (nearbyMobiliers.some(m => m.id === mob.id)) { setTerrainSheetOpen(true); toast.info("Mode édition"); } 
       else { toast.info('Trop loin'); setCurrentPosition({ lat: mob.latitude, lng: mob.longitude }); }
    }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  if (!currentUser) return null;

  const isTerrain = currentUser.role === 'agent-terrain';
  const roleLabel = isTerrain ? 'Agent Terrain' : 'Agent Bureau';
  const roleColor = isTerrain ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300';
  
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden">
      <Toaster />
      
      {/* Sheet Bureau com a nova prop onDelete */}
      {currentUser.role === 'agent-bureau' && (
        <BureauEditSheet 
            open={isBureauEditOpen} 
            onOpenChange={setIsBureauEditOpen} 
            mobilier={selectedMobilierForEdit} 
            onSave={handleUpdateExisting} 
            onDelete={handleDeleteMobilier} // Passando a função aqui
        />
      )}

      <Sheet open={terrainSheetOpen} onOpenChange={setTerrainSheetOpen}>
        <SheetContent side="left" className="w-full max-w-[500px] flex flex-col pt-10"> 
          <SheetHeader className="mb-4 shrink-0">
             <SheetTitle>Formulaire Terrain</SheetTitle>
             <SheetDescription>{nearbyMobiliers.length > 0 ? "Modification" : "Nouveau"}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
             <RecensementForm onSubmit={handleSubmitRecensement} agent={currentUser.username} nearbyMobiliers={nearbyMobiliers} />
          </div>
        </SheetContent>
      </Sheet>

      {/* HEADER */}
      <header className="flex-none bg-white border-b px-4 h-[60px] flex items-center justify-between shadow-sm z-50">
        <div>
          <h1 className="text-xl font-bold text-indigo-600">Recensement MEL</h1>
          <div className="flex items-center gap-2 mt-1"><p className="text-sm text-gray-600">Agent: {currentUser.username}</p><Badge className={`${roleColor} border text-xs`}>{roleLabel}</Badge></div>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm"><LogOut className="size-4 mr-2" />Déconnexion</Button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs defaultValue="carte" className="flex-1 flex flex-col h-full w-full">
          
          <div className="flex-none bg-white border-b px-4 py-2 z-40">
            <TabsList className="grid w-full max-w-xl grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="carte" 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
              >
                <Map className="size-4 mr-2" /> Carte
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
              >
                <BarChart3 className="size-4 mr-2" /> Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="profil"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
              >
                <UserIcon className="size-4 mr-2" /> Profil
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="carte" className="flex-1 relative w-full h-full p-0 m-0 data-[state=inactive]:hidden">
            <div className="absolute inset-0 w-full h-full">
                <MapRecensement
                  mobiliers={mobiliers}
                  currentPosition={currentPosition}
                  nearbyMobiliers={nearbyMobiliers}
                  onMarkerClick={handleMobilierClick}
                  userRole={isTerrain ? 'terrain' : 'bureau'}
                />
            </div>
            {isTerrain && (
                <div className="absolute top-4 right-4 z-[500]">
                    <Button 
                        onClick={() => setTerrainSheetOpen(true)} 
                        className="bg-indigo-600 shadow-lg border-2 border-white text-white hover:bg-indigo-700"
                    >
                        <PlusCircle className="mr-2 size-5" /> Nouveau
                    </Button>
                </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 flex flex-col min-h-0 p-0 m-0 data-[state=inactive]:hidden bg-gray-50">
             <div className="flex-none bg-white border-b p-4 max-h-[40%] overflow-y-auto">
                <DashboardStats mobiliers={mobiliers} />
             </div>
             <div className="flex-1 overflow-y-auto p-4">
                 <h2 className="text-lg font-bold mb-3 text-gray-800">Liste détaillée</h2>
                 <MobilierList mobiliers={mobiliers} onEdit={handleMobilierClick} userRole={isTerrain ? 'terrain' : 'bureau'} nearbyMobiliers={nearbyMobiliers} />
             </div>
          </TabsContent>

          <TabsContent value="profil" className="flex-1 p-0 m-0 overflow-hidden bg-gray-50 data-[state=inactive]:hidden">
             <ProfilePage user={currentUser} mobiliers={mobiliers} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
