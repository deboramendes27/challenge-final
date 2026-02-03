import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { MapPin, Calendar, User } from 'lucide-react';
import { Mobilier, STATE_CONFIG, CATEGORY_LABELS } from '@/app/types/mobilier';

interface MobilierDetailDialogProps {
  mobilier: Mobilier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobilierDetailDialog({ mobilier, open, onOpenChange }: MobilierDetailDialogProps) {
  if (!mobilier) return null;

  const stateConfig = STATE_CONFIG[mobilier.state];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{mobilier.type}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Photo */}
          {mobilier.photo && (
            <div className="w-full">
              <img
                src={mobilier.photo}
                alt={`Photo de ${mobilier.type}`}
                className="w-full h-auto max-h-96 object-contain rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Catégorie</p>
              <p className="font-medium">{CATEGORY_LABELS[mobilier.category]}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">État</p>
              <div className={`inline-block px-3 py-1 rounded border ${stateConfig.bgColor}`}>
                <span className={stateConfig.color}>{stateConfig.label}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Gestionnaire</p>
              <Badge variant="outline" className="mt-1">{mobilier.gestionnaire}</Badge>
            </div>

            <div>
              <p className="text-sm text-gray-600">Criticité</p>
              <Badge 
                variant={mobilier.criticite === 'urgent sécurité' ? 'destructive' : 'secondary'}
                className="mt-1"
              >
                {mobilier.criticite}
              </Badge>
            </div>
          </div>

          {/* Position GPS */}
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <MapPin className="size-4" />
              Position GPS
            </p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {mobilier.latitude.toFixed(6)}, {mobilier.longitude.toFixed(6)}
            </p>
          </div>

          {/* Commentaire */}
          {mobilier.commentaire && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Commentaire</p>
              <p className="text-sm bg-gray-50 p-3 rounded italic">{mobilier.commentaire}</p>
            </div>
          )}

          {/* Informations de recensement */}
          <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <User className="size-4" />
              Recensé par <span className="font-medium text-gray-900">{mobilier.agent}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="size-4" />
              Le {new Date(mobilier.dateRecensement).toLocaleDateString('fr-FR')} à{' '}
              {new Date(mobilier.dateRecensement).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-xs text-gray-500">ID: {mobilier.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
