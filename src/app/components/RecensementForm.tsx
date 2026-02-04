import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Mobilier, MOBILIER_TYPES, MobilierState, MobilierCategory, CATEGORY_LABELS } from '@/app/types/mobilier';
import { Save, Navigation, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface RecensementFormProps {
  onSubmit: (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => void;
  agent: string;
  nearbyMobiliers?: Mobilier[];
  onUpdateExisting?: (mobilier: Mobilier) => void;
}

export function RecensementForm({ onSubmit, agent }: RecensementFormProps) {
  // Estados do Formulário
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  
  const [category, setCategory] = useState<MobilierCategory | ''>('');
  const [type, setType] = useState('');
  const [state, setState] = useState<MobilierState>('correct'); // Default como na imagem
  const [gestionnaire, setGestionnaire] = useState('MEL');
  const [criticite, setCriticite] = useState('OK');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Filtra os tipos baseado na categoria selecionada
  const filteredTypes = category 
    ? MOBILIER_TYPES.filter(t => t.category === category)
    : [];

  useEffect(() => { getGPS(); }, []);

  const getGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS non supporté");
      setPosition({ lat: 50.6292, lng: 3.0573 });
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingGPS(false);
      },
      (err) => {
        console.error(err);
        // toast.warning("Erreur GPS"); // Comentado para limpar a UI na demo
        setPosition({ lat: 50.6292, lng: 3.0573 }); // Fallback Lille
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !position || !category) {
        toast.error("Veuillez remplir les champs obligatoires");
        return;
    }

    const typeLabel = MOBILIER_TYPES.find(t => t.id === type)?.label || type;

    onSubmit({
      type: typeLabel,
      category: category as MobilierCategory,
      state,
      latitude: position.lat,
      longitude: position.lng,
      agent,
      gestionnaire: gestionnaire as any,
      criticite: criticite as any,
      commentaire: comment,
      photo: photo
    });
  };

  return (
    <div className="flex flex-col gap-5 bg-white h-full pb-20 px-1">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        <span className="size-2 rounded-full bg-indigo-600 block"></span>
        Nouveau recensement
      </h2>

      {/* 1. POSITION GPS */}
      <div className="space-y-2">
        <Label className="font-semibold">Position GPS</Label>
        <Input 
            value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ''} 
            disabled 
            className="bg-gray-50 border-gray-200 text-gray-500"
        />
        <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={getGPS} 
            disabled={loadingGPS}
        >
            {loadingGPS ? <Loader2 className="animate-spin size-4 mr-2" /> : <Navigation className="size-4 mr-2" />}
            Utiliser ma position actuelle
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* 2. CATÉGORIE */}
        <div className="space-y-2">
            <Label className="font-semibold">Catégorie de mobilier</Label>
            <Select value={category} onValueChange={(val) => { setCategory(val as MobilierCategory); setType(''); }}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* 3. TYPE */}
        <div className="space-y-2">
            <Label className="font-semibold">Type de mobilier</Label>
            <Select value={type} onValueChange={setType} disabled={!category}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white max-h-[200px]">
                    {filteredTypes.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* 4. ÉTAT DU MOBILIER (Botões Grandes) */}
        <div className="space-y-2">
            <Label className="font-semibold">État du mobilier</Label>
            <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'neuf', label: 'Neuf' },
                  { id: 'correct', label: 'Correct' }, // Default blue in image
                  { id: 'endommagé', label: 'Endommagé' },
                  { id: 'dangereux', label: 'Dangereux' }
                ].map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => setState(s.id as MobilierState)}
                        className={`py-3 px-4 rounded border text-sm font-medium transition-all ${
                            state === s.id 
                            ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>

        {/* 5. GESTIONNAIRE */}
        <div className="space-y-2">
            <Label className="font-semibold">Gestionnaire présumé</Label>
            <Select value={gestionnaire} onValueChange={setGestionnaire}>
                <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[10000] bg-white">
                    <SelectItem value="MEL">MEL</SelectItem>
                    <SelectItem value="commune">Commune</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* 6. CRITICITÉ */}
        <div className="space-y-2">
            <Label className="font-semibold">Niveau de criticité</Label>
            <Select value={criticite} onValueChange={setCriticite}>
                <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[10000] bg-white">
                    <SelectItem value="OK">OK</SelectItem>
                    <SelectItem value="à surveiller">À surveiller</SelectItem>
                    <SelectItem value="urgent sécurité">Urgent sécurité</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {/* 7. COMMENTAIRE */}
        <div className="space-y-2">
            <Label className="font-semibold">Commentaire (optionnel)</Label>
            <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="bg-gray-50 border-gray-200 min-h-[80px]"
                placeholder="Ajoutez des observations..."
            />
        </div>

        {/* 8. PHOTO */}
        <div className="space-y-2">
            <Label className="font-semibold">Photo de l'état (optionnel)</Label>
            <Button type="button" variant="outline" className="w-full flex gap-2 border-gray-300 text-gray-700">
                <Camera className="size-4" /> Prendre une photo / Ajouter une image
            </Button>
        </div>

        {/* SUBMIT */}
        <div className="pt-4">
            <Button type="submit" className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-medium text-lg rounded-md">
                <Save className="size-5 mr-2" /> Enregistrer le recensement
            </Button>
        </div>
      </form>
    </div>
  );
}