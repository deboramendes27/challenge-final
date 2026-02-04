import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Mobilier, MOBILIER_TYPES, MobilierState, MobilierCategory, CATEGORY_LABELS, STATE_CONFIG } from '@/app/types/mobilier';
import { Save, Navigation, Loader2, Camera, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface RecensementFormProps {
  onSubmit: (data: Omit<Mobilier, 'id' | 'dateRecensement'>) => void;
  agent: string;
}

export function RecensementForm({ onSubmit, agent }: RecensementFormProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  
  const [category, setCategory] = useState<MobilierCategory | ''>('');
  const [type, setType] = useState('');
  const [state, setState] = useState<MobilierState>('correct');
  const [gestionnaire, setGestionnaire] = useState('inconnu'); // Padrão
  const [criticite, setCriticite] = useState('OK');
  const [comment, setComment] = useState('');
  
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTypes = category 
    ? MOBILIER_TYPES.filter(t => t.category === category)
    : [];

  useEffect(() => { getGPS(); }, []);

  const getGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS non supporté par ce navigateur");
      return;
    }
    setLoadingGPS(true);
    // Timeout alto (15s) e alta precisão forçada
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingGPS(false);
        toast.success("Position GPS précise trouvée !");
      },
      (err) => {
        console.error(err);
        setLoadingGPS(false);
        setPosition(null); // Garante que não há posição válida
        let msg = "Erreur GPS.";
        if (err.code === 1) msg = "Permission GPS refusée.";
        if (err.code === 2) msg = "Signal GPS introuvable (essayez dehors).";
        if (err.code === 3) msg = "Délai d'attente dépassé.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast.success("Photo ajoutée !");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !position || !category) {
        toast.error("Champs obligatoires manquants (Type, Catégorie ou GPS)");
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
      photo: photo || undefined
      // NUNCA enviamos distributeur ou description_technique aqui
      // Isso garante que o item nasça "Não Validado"
    });
  };

  return (
    <div className="flex flex-col gap-5 bg-white h-full pb-20 px-1">
      <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
        <span className="size-2 rounded-full bg-indigo-600 block"></span>
        Nouveau recensement
      </h2>

      {/* POSIÇÃO GPS */}
      <div className="space-y-2">
        <Label className="font-semibold text-gray-700">Position GPS <span className="text-red-500">*</span></Label>
        <Input 
            value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ''} 
            placeholder="En attente du signal..."
            disabled 
            className={`font-mono text-xs ${!position ? 'border-red-300 bg-red-50' : 'bg-gray-50 border-gray-200'}`}
        />
        <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 h-9"
            onClick={getGPS} 
            disabled={loadingGPS}
        >
            {loadingGPS ? <Loader2 className="animate-spin size-3 mr-2" /> : <Navigation className="size-3 mr-2" />}
            {position ? "Actualiser la position" : "Réessayer le GPS"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* CATEGORIA */}
        <div className="space-y-2">
            <Label className="font-semibold text-gray-700">Catégorie <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(val) => { setCategory(val as MobilierCategory); setType(''); }}>
                <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* TIPO */}
        <div className="space-y-2">
            <Label className="font-semibold text-gray-700">Type <span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={setType} disabled={!category}>
                <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder={category ? "Sélectionnez..." : "-"} />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-white max-h-[200px]">
                    {filteredTypes.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* ESTADO */}
        <div className="space-y-2">
            <Label className="font-semibold text-gray-700">État</Label>
            <div className="grid grid-cols-2 gap-3">
                {(Object.keys(STATE_CONFIG) as MobilierState[]).map((s) => {
                    const config = STATE_CONFIG[s];
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setState(s)}
                            className={`py-3 px-2 rounded border text-sm font-medium transition-all ${
                                state === s 
                                ? `${config.bgColor} ${config.color} border-current ring-1 ring-offset-1 ring-current` 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {config.label.split(' / ')[0]}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* GESTIONNAIRE & CRITICITE */}
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Gestionnaire</Label>
                <Select value={gestionnaire} onValueChange={setGestionnaire}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10000] bg-white">
                        <SelectItem value="inconnu">Inconnu</SelectItem>
                        <SelectItem value="MEL">MEL</SelectItem>
                        <SelectItem value="commune">Commune</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Criticité</Label>
                <Select value={criticite} onValueChange={setCriticite}>
                    <SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10000] bg-white">
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="à surveiller">À surveiller</SelectItem>
                        <SelectItem value="urgent sécurité">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* COMENTARIO */}
        <div className="space-y-2">
            <Label className="font-semibold text-gray-700">Commentaire</Label>
            <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="bg-white border-gray-300 min-h-[60px]"
                placeholder="..."
            />
        </div>

        {/* FOTO */}
        <div className="space-y-2">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            {!photo ? (
                <Button type="button" variant="outline" className="w-full flex gap-2 border-gray-300 text-gray-700 h-10" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="size-4" /> Ajouter une photo
                </Button>
            ) : (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 group">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" variant="destructive" size="sm" onClick={handleRemovePhoto}><X className="size-4 mr-2" /> Supprimer</Button>
                    </div>
                </div>
            )}
        </div>

        <div className="pt-2 pb-4">
            <Button type="submit" className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white font-medium text-lg rounded-md shadow-md" disabled={!position}>
                <Save className="size-5 mr-2" /> Enregistrer
            </Button>
        </div>
      </form>
    </div>
  );
}