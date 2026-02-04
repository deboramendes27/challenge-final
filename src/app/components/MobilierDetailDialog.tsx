import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Mobilier, STATE_CONFIG, CATEGORY_LABELS } from "@/app/types/mobilier";
import { MapPin, Calendar, User, Info, AlertTriangle } from "lucide-react";

interface MobilierDetailDialogProps {
  mobilier: Mobilier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobilierDetailDialog({ mobilier, open, onOpenChange }: MobilierDetailDialogProps) {
  if (!mobilier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {mobilier.type}
          </DialogTitle>
          <DialogDescription>
             Identifiant: {mobilier.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* FOTO GRANDE */}
          <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden border">
            {mobilier.photo ? (
              <img src={mobilier.photo} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Info className="size-8 mb-2 opacity-50"/>
                <span>Aucune photo disponible</span>
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-3 rounded border">
                <span className="text-xs text-gray-500 uppercase font-bold">État Physique</span>
                <div className={`mt-1 flex items-center gap-2 font-medium ${STATE_CONFIG[mobilier.state].color}`}>
                   {STATE_CONFIG[mobilier.state].label}
                </div>
             </div>
             <div className="bg-gray-50 p-3 rounded border">
                <span className="text-xs text-gray-500 uppercase font-bold">Criticité</span>
                <div className={`mt-1 flex items-center gap-2 font-medium ${
                    mobilier.criticite === 'urgent sécurité' ? 'text-red-600' : 
                    mobilier.criticite === 'à surveiller' ? 'text-orange-600' : 'text-green-600'
                }`}>
                   {mobilier.criticite === 'urgent sécurité' && <AlertTriangle className="size-4"/>}
                   {mobilier.criticite.toUpperCase()}
                </div>
             </div>
          </div>

          {/* INFO TÉCNICA (BUREAU) */}
          {mobilier.distributeur && (
             <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-1">
                    <Info className="size-3"/> Données Techniques (Bureau)
                </h4>
                <p className="text-sm text-gray-800"><strong>Distributeur:</strong> {mobilier.distributeur}</p>
                <p className="text-sm text-gray-800 mt-1"><strong>Description:</strong> {mobilier.description_technique}</p>
             </div>
          )}

          {/* DETALHES GERAIS */}
          <div className="space-y-3 text-sm">
             <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-500 flex items-center gap-2"><MapPin className="size-4"/> Localisation</span>
                <span className="font-mono">{mobilier.latitude.toFixed(5)}, {mobilier.longitude.toFixed(5)}</span>
             </div>
             <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-500 flex items-center gap-2"><User className="size-4"/> Agent Terrain</span>
                <span>{mobilier.agent}</span>
             </div>
             <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-500 flex items-center gap-2"><Calendar className="size-4"/> Date</span>
                <span>{new Date(mobilier.dateRecensement).toLocaleDateString('fr-FR')}</span>
             </div>
             <div className="py-2">
                <span className="text-gray-500 block mb-1">Catégorie</span>
                <Badge variant="outline">{CATEGORY_LABELS[mobilier.category]}</Badge>
             </div>
             <div className="py-2 bg-gray-50 p-3 rounded mt-2">
                <span className="text-gray-500 block mb-1 text-xs uppercase font-bold">Commentaire</span>
                <p className="italic text-gray-600">{mobilier.commentaire || "Aucun commentaire."}</p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}