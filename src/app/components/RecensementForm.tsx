import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { MapPin, AlertTriangle, Save, Navigation, Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  MobilierState,
  MobilierCategory,
  MOBILIER_TYPES,
  CATEGORY_LABELS,
  STATE_CONFIG,
  Mobilier,
} from '@/app/types/mobilier';

interface RecensementFormProps {
  onSubmit: (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => void;
  agent: string;
  nearbyMobiliers: Mobilier[];
  onUpdateExisting?: (mobilier: Mobilier) => void;
}

export function RecensementForm({ onSubmit, agent, nearbyMobiliers, onUpdateExisting }: RecensementFormProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MobilierCategory | ''>('');
  const [selectedType, setSelectedType] = useState('');
  const [state, setState] = useState<MobilierState>('correct');
  const [gestionnaire, setGestionnaire] = useState<'MEL' | 'commune' | 'inconnu'>('MEL');
  const [criticite, setCriticite] = useState<'OK' | 'à surveiller' | 'urgent sécurité'>('OK');
  const [commentaire, setCommentaire] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const filteredTypes = selectedCategory
    ? MOBILIER_TYPES.filter((t) => t.category === selectedCategory)
    : MOBILIER_TYPES;

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsGettingLocation(false);
          toast.success('Position GPS récupérée');
        },
        (error) => {
          console.error('Erreur GPS:', error);
          toast.warning('GPS indisponible. Utilisation position par défaut (Lille).');
          setPosition({ lat: 50.6292, lng: 3.0573 });
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      toast.warning('GPS non supporté.');
      setPosition({ lat: 50.6292, lng: 3.0573 });
      setIsGettingLocation(false);
    }
  };

  useEffect(() => { getCurrentLocation(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !selectedType) return;

    const selectedTypeObj = MOBILIER_TYPES.find((t) => t.id === selectedType);
    if (!selectedTypeObj) return;

    onSubmit({
      type: selectedTypeObj.label,
      category: selectedTypeObj.category,
      state,
      latitude: position.lat,
      longitude: position.lng,
      gestionnaire,
      criticite,
      commentaire: commentaire.trim() || undefined,
      agent,
      photo,
    });

    // Reset
    setSelectedType('');
    setState('correct');
    setCommentaire('');
    setPhoto(null);
    getCurrentLocation();
  };

  const handleUpdateExisting = (mobilier: Mobilier) => {
    if (onUpdateExisting) {
      onUpdateExisting({
        ...mobilier,
        state,
        gestionnaire,
        criticite,
        commentaire: commentaire.trim() || mobilier.commentaire,
        photo,
      });
      setSelectedType('');
      setState('correct');
      setCommentaire('');
      setPhoto(null);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhoto(reader.result as string); toast.success('Photo ajoutée'); };
      reader.readAsDataURL(file);
    }
  };

  return (
    // Removido o Card e o scroll interno fixo. Agora flui com o container pai (Sheet).
    <div className="pb-10"> 
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Alerta de Vizinhança (Edição) */}
          {nearbyMobiliers.length > 0 && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="size-4 text-red-600" />
              <AlertDescription>
                <p className="font-semibold mb-2 text-red-800">
                  {nearbyMobiliers.length} élément(s) détecté(s) à proximité :
                </p>
                <div className="space-y-2">
                  {nearbyMobiliers.map((mob) => (
                    <div key={mob.id} className="bg-white p-3 rounded border shadow-sm text-sm">
                      <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">{mob.type}</p>
                            <p className="text-xs text-gray-500">ID: {mob.id} | {STATE_CONFIG[mob.state].label}</p>
                          </div>
                          <Badge variant="outline">{mob.category}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-2 w-full border bg-gray-50 hover:bg-gray-100"
                        onClick={() => handleUpdateExisting(mob)}
                      >
                        Modifier cet élément existant
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* GPS */}
          <div className="space-y-2">
            <Label>Position GPS</Label>
            <div className="flex gap-2">
              <Input value={position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : '...'} disabled className="bg-gray-50" />
              <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation} disabled={isGettingLocation} title="Actualiser GPS">
                {isGettingLocation ? <Loader2 className="animate-spin size-4"/> : <Navigation className="size-4"/>}
              </Button>
            </div>
          </div>

          {/* Categoria e Tipo */}
          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val as MobilierCategory); setSelectedType(''); }}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as MobilierCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>Type d'objet</Label>
                <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedCategory}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                    {filteredTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
             </div>
          </div>

          {/* Estado Físico */}
          <div className="space-y-2">
            <Label>État Physique</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATE_CONFIG) as MobilierState[]).map((stateKey) => (
                <button
                  key={stateKey} type="button" onClick={() => setState(stateKey)}
                  className={`p-2 rounded border text-sm transition-all text-left ${
                    state === stateKey ? `${STATE_CONFIG[stateKey].bgColor} border-current ring-1 ring-offset-1` : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <span className={`block font-medium ${state === stateKey ? STATE_CONFIG[stateKey].color : ''}`}>
                     {STATE_CONFIG[stateKey].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes Extras */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Gestionnaire</Label>
                <Select value={gestionnaire} onValueChange={(v: any) => setGestionnaire(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="MEL">MEL</SelectItem>
                    <SelectItem value="commune">Commune</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Criticité</Label>
                <Select value={criticite} onValueChange={(v: any) => setCriticite(v)}>
                <SelectTrigger className={criticite === 'urgent sécurité' ? 'text-red-600 font-bold' : ''}><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="OK">OK (R.A.S)</SelectItem>
                    <SelectItem value="à surveiller">À surveiller</SelectItem>
                    <SelectItem value="urgent sécurité">🔴 Urgent</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="flex items-center gap-4">
               <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border text-sm font-medium transition-colors">
                     <Camera className="size-4"/> Ajouter une photo
                  </div>
                  <Input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
               </label>
               {photo && (
                   <div className="relative group">
                       <img src={photo} className="h-12 w-12 object-cover rounded border" alt="Preview"/>
                       <button type="button" onClick={() => setPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                           <X className="size-3"/>
                       </button>
                   </div>
               )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Commentaire</Label>
            <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="..." rows={2} />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!position || !selectedType}>
            <Save className="size-4 mr-2" /> Enregistrer
          </Button>
        </form>
    </div>
  );
}