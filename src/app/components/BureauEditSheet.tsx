import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Mobilier } from '@/app/types/mobilier';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle, AlertCircle, Save, MapPin, Calendar, User, Info } from 'lucide-react';

interface BureauEditSheetProps {
  mobilier: Mobilier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedMob: Mobilier) => void;
}

export function BureauEditSheet({ mobilier, open, onOpenChange, onSave }: BureauEditSheetProps) {
  const [distributeur, setDistributeur] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (mobilier) {
      setDistributeur(mobilier.distributeur || '');
      setDesc(mobilier.description_technique || '');
    }
  }, [mobilier]);

  const handleSave = () => {
    if (!mobilier) return;
    onSave({
      ...mobilier,
      distributeur: distributeur,
      description_technique: desc
    });
    onOpenChange(false);
  };

  if (!mobilier) return null;

  const categorized = (distributeur.trim() !== '' && desc.trim() !== '');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0">
        
        {/* 1. FOTO FIXA NO TOPO */}
        <div className="w-full h-64 bg-gray-100 relative">
          {mobilier.photo ? (
            <img src={mobilier.photo} alt="Ref" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="flex items-center gap-2"><Info /> Pas de photo</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
             {categorized ? 
               <Badge className="bg-green-600 shadow-lg text-sm py-1 px-3"><CheckCircle className="size-4 mr-1"/> Complet</Badge> : 
               <Badge variant="destructive" className="bg-orange-500 shadow-lg text-sm py-1 px-3"><AlertCircle className="size-4 mr-1"/> À Traiter</Badge>
             }
          </div>
        </div>

        <div className="p-6 space-y-6">
          <SheetHeader className="p-0">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-indigo-800">
              {mobilier.type}
            </SheetTitle>
            <SheetDescription>
              ID: {mobilier.id} • Gestionnaire: {mobilier.gestionnaire}
            </SheetDescription>
          </SheetHeader>

          {/* 2. INFORMAÇÕES GERAIS (READONLY) */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
             <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin className="size-3"/> Localisation</p>
                <p className="font-mono text-sm">{mobilier.latitude.toFixed(5)}, {mobilier.longitude.toFixed(5)}</p>
             </div>
             <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="size-3"/> Date</p>
                <p className="text-sm">{new Date(mobilier.dateRecensement).toLocaleDateString('fr-FR')}</p>
             </div>
             <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="size-3"/> Agent Terrain</p>
                <p className="text-sm font-medium">{mobilier.agent}</p>
             </div>
             <div>
                <p className="text-xs text-gray-500 mb-1">État Physique</p>
                <Badge variant="outline">{mobilier.state}</Badge>
             </div>
             <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Commentaire Terrain</p>
                <p className="text-sm italic text-gray-700">{mobilier.commentaire || "Aucun commentaire."}</p>
             </div>
          </div>

          <div className="border-t my-4"></div>

          {/* 3. CAMPOS DE EDIÇÃO BUREAU */}
          <div className="space-y-4">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
              <Info className="size-4"/> Données Techniques (Bureau)
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="distributeur" className="text-gray-700">Fabricant / Distributeur *</Label>
              <Input 
                id="distributeur" 
                value={distributeur} 
                onChange={(e) => setDistributeur(e.target.value)}
                placeholder="Ex: JCDecaux, Husson..."
                className="border-emerald-200 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc" className="text-gray-700">Description Technique / Modèle *</Label>
              <Textarea 
                id="desc" 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Banc modèle X en bois traité, scellement béton..."
                className="min-h-[100px] border-emerald-200 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <SheetFooter>
            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg">
              <Save className="mr-2 size-5" /> Sauvegarder et Catégoriser
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}