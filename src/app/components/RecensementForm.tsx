import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { MapPin, AlertTriangle, Save, Navigation, MapPinOff, Camera, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  MobilierState,
  MobilierCategory,
  MOBILIER_TYPES,
  CATEGORY_LABELS,
  STATE_CONFIG,
  Mobilier,
  MobilierType,
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
  const [geoError, setGeoError] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const filteredTypes = selectedCategory
    ? MOBILIER_TYPES.filter((t) => t.category === selectedCategory)
    : MOBILIER_TYPES;

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setGeoError('');
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsGettingLocation(false);
          toast.success('Position GPS récupérée');
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          let errorMessage = 'Erreur de géolocalisation';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission de géolocalisation refusée. Utilisation de la position par défaut (Lille).';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position indisponible. Utilisation de la position par défaut (Lille).';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai dépassé. Utilisation de la position par défaut (Lille).';
              break;
            default:
              errorMessage = 'Erreur inconnue. Utilisation de la position par défaut (Lille).';
          }
          
          setGeoError(errorMessage);
          toast.warning(errorMessage);
          
          // Position par défaut : Lille
          setPosition({ lat: 50.6292, lng: 3.0573 });
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setGeoError('Géolocalisation non disponible dans ce navigateur. Position par défaut (Lille).');
      toast.warning('Géolocalisation non disponible');
      // Position par défaut : Lille
      setPosition({ lat: 50.6292, lng: 3.0573 });
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

    // Reset form
    setSelectedType('');
    setState('correct');
    setCriticite('OK');
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
      
      // Reset form
      setSelectedType('');
      setState('correct');
      setCriticite('OK');
      setCommentaire('');
      setPhoto(null);
      getCurrentLocation();
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast.success('Photo ajoutée');
      };
      reader.onerror = () => {
        toast.error('Erreur lors de la lecture de la photo');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5" />
          Nouveau recensement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Position GPS */}
          <div className="space-y-2">
            <Label>Position GPS</Label>
            <div className="space-y-2">
              <Input
                value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'En attente...'}
                disabled
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Localisation en cours...
                  </>
                ) : (
                  <>
                    <Navigation className="size-4 mr-2" />
                    Utiliser ma position actuelle
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alerte doublons */}
          {nearbyMobiliers.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">
                  {nearbyMobiliers.length} mobilier(s) détecté(s) à moins de 10m :
                </p>
                <div className="space-y-2">
                  {nearbyMobiliers.map((mob) => (
                    <div key={mob.id} className="bg-white p-2 rounded text-sm">
                      <p className="font-medium">{mob.type}</p>
                      <p className="text-xs text-gray-600">
                        État: {STATE_CONFIG[mob.state].label} | {mob.gestionnaire}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleUpdateExisting(mob)}
                      >
                        Mettre à jour cet existant
                      </Button>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie de mobilier</Label>
            <Select value={selectedCategory} onValueChange={(val) => {
              setSelectedCategory(val as MobilierCategory);
              setSelectedType('');
            }}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as MobilierCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type de mobilier */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de mobilier</Label>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedCategory}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {filteredTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* État */}
          <div className="space-y-2">
            <Label>État du mobilier</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATE_CONFIG) as MobilierState[]).map((stateKey) => {
                const config = STATE_CONFIG[stateKey];
                return (
                  <button
                    key={stateKey}
                    type="button"
                    onClick={() => setState(stateKey)}
                    className={`p-3 rounded border-2 transition-all ${
                      state === stateKey
                        ? `${config.bgColor} border-current`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={state === stateKey ? config.color : 'text-gray-700'}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gestionnaire */}
          <div className="space-y-2">
            <Label htmlFor="gestionnaire">Gestionnaire présumé</Label>
            <Select value={gestionnaire} onValueChange={(val) => setGestionnaire(val as any)}>
              <SelectTrigger id="gestionnaire">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEL">MEL</SelectItem>
                <SelectItem value="commune">Commune</SelectItem>
                <SelectItem value="inconnu">Inconnu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Criticité */}
          <div className="space-y-2">
            <Label htmlFor="criticite">Niveau de criticité</Label>
            <Select value={criticite} onValueChange={(val) => setCriticite(val as any)}>
              <SelectTrigger id="criticite">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="à surveiller">À surveiller</SelectItem>
                <SelectItem value="urgent sécurité">Urgent sécurité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajoutez des observations..."
              rows={3}
            />
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label>Photo de l'état (optionnel)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <span className="flex items-center gap-2">
                      <Camera className="size-4" />
                      Prendre une photo / Ajouter une image
                    </span>
                  </Button>
                </label>
              </div>
              {photo && (
                <div className="relative inline-block">
                  <img
                    src={photo}
                    alt="Photo du mobilier"
                    className="w-full max-w-xs h-auto object-cover rounded border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => setPhoto(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!position || !selectedType}>
            <Save className="size-4 mr-2" />
            Enregistrer le recensement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}