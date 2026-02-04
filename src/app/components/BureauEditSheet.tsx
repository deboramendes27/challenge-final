import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Mobilier, MobilierState, MobilierCategory, CATEGORY_LABELS } from '@/app/types/mobilier';
import { Save, Camera, MapPin } from 'lucide-react';

interface BureauEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobilier: Mobilier | null;
  onSave: (mobilier: Mobilier) => void;
}

export function BureauEditSheet({ open, onOpenChange, mobilier, onSave }: BureauEditSheetProps) {
  // Estados para TODOS os campos
  const [category, setCategory] = useState<MobilierCategory | ''>('');
  const [type, setType] = useState('');
  const [state, setState] = useState<MobilierState>('correct');
  const [gestionnaire, setGestionnaire] = useState('');
  const [criticite, setCriticite] = useState('');
  const [comment, setComment] = useState('');
  
  // CAMPOS EXTRAS BUREAU
  const [distributeur, setDistributeur] = useState('');
  const [materiau, setMateriau] = useState('');
  const [reference, setReference] = useState('');
  const [dateInstall, setDateInstall] = useState('');
  const [dateRenov, setDateRenov] = useState('');

  useEffect(() => {
    if (mobilier) {
      setCategory(mobilier.category || '');
      setType(mobilier.type || '');
      setState(mobilier.state || 'correct');
      setGestionnaire(mobilier.gestionnaire || 'MEL');
      setCriticite(mobilier.criticite || 'OK');
      setComment(mobilier.commentaire || '');
      
      // Carrega campos extras se existirem (assumindo que o tipo Mobilier foi estendido ou usando 'as any')
      const m = mobilier as any;
      setDistributeur(m.distributeur || '');
      setMateriau(m.materiau || '');
      setReference(m.reference || '');
      setDateInstall(m.dateInstallation || '');
      setDateRenov(m.derniereRenovation || '');
    }
  }, [mobilier]);

  const handleSave = () => {
    if (!mobilier) return;
    const updated = {
      ...mobilier,
      category: category as any,
      type,
      state,
      gestionnaire: gestionnaire as any,
      criticite: criticite as any,
      commentaire: comment,
      // Salva campos extras
      distributeur,
      materiau,
      reference,
      dateInstallation: dateInstall,
      derniereRenovation: dateRenov
    };
    onSave(updated);
  };

  if (!mobilier) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Janela Larga para caber o formulário completo */}
      <SheetContent side="right" className="w-[500px] sm:w-[600px] bg-white border-l shadow-2xl z-[9999] flex flex-col p-0">
        
        {/* Header fixo */}
        <SheetHeader className="p-6 border-b shrink-0 bg-white">
          <SheetTitle className="flex items-center gap-2">
             <MapPin className="size-5 text-indigo-600"/> Nouveau recensement (Mode Bureau)
          </SheetTitle>
          <SheetDescription>
            Validation et enrichissement des données
          </SheetDescription>
        </SheetHeader>
        
        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* 1. DADOS DE POSIÇÃO (Read-only no bureau) */}
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700">Position GPS</Label>
            <Input value={`${mobilier.latitude}, ${mobilier.longitude}`} disabled className="bg-gray-100" />
            <Button variant="outline" disabled className="w-full text-gray-400">Utiliser ma position actuelle</Button>
          </div>

          {/* 2. DADOS BÁSICOS (Editáveis) */}
          <div className="space-y-2">
            <Label className="font-semibold">Catégorie de mobilier</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
               <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
               <SelectContent className="z-[10000] bg-white">
                 {Object.entries(CATEGORY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
               </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Type de mobilier</Label>
             <Input value={type} onChange={e => setType(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">État du mobilier</Label>
            <div className="grid grid-cols-2 gap-3">
                {['neuf', 'correct', 'endommagé', 'dangereux'].map((s) => (
                    <button key={s} type="button" onClick={() => setState(s as MobilierState)}
                        className={`py-3 px-4 rounded border text-sm font-medium capitalize ${
                            state === s ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm' : 'bg-white border-gray-200'
                        }`}>
                        {s}
                    </button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Gestionnaire présumé</Label>
            <Select value={gestionnaire} onValueChange={setGestionnaire}>
               <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
               <SelectContent className="z-[10000] bg-white">
                 <SelectItem value="MEL">MEL</SelectItem>
                 <SelectItem value="commune">Commune</SelectItem>
                 <SelectItem value="inconnu">Inconnu</SelectItem>
               </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Niveau de criticité</Label>
            <Select value={criticite} onValueChange={setCriticite}>
               <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
               <SelectContent className="z-[10000] bg-white">
                 <SelectItem value="OK">OK</SelectItem>
                 <SelectItem value="à surveiller">À surveiller</SelectItem>
                 <SelectItem value="urgent sécurité">Urgent sécurité</SelectItem>
               </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label className="font-semibold">Commentaire</Label>
             <Textarea value={comment} onChange={e => setComment(e.target.value)} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
             <Label className="font-semibold">Photo</Label>
             <Button variant="outline" className="w-full" disabled><Camera className="size-4 mr-2"/> {mobilier.photo ? "Photo présente" : "Pas de photo"}</Button>
          </div>

          {/* 3. CAMPOS EXTRAS (BUREAU ONLY) */}
          <div className="border-t pt-6 space-y-4">
             <h3 className="font-bold text-gray-900">Données Techniques Complémentaires</h3>
             
             <div className="space-y-2">
                <Label>Distributeur</Label>
                <Input placeholder="Nom du distributeur" value={distributeur} onChange={e => setDistributeur(e.target.value)} className="bg-gray-50" />
             </div>

             <div className="space-y-2">
                <Label>Matériau</Label>
                <Input placeholder="Matériau du mobilier" value={materiau} onChange={e => setMateriau(e.target.value)} className="bg-gray-50" />
             </div>

             <div className="space-y-2">
                <Label>Référence</Label>
                <Input placeholder="Référence du mobilier" value={reference} onChange={e => setReference(e.target.value)} className="bg-gray-50" />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Date d'installation</Label>
                  <Input type="date" value={dateInstall} onChange={e => setDateInstall(e.target.value)} className="bg-gray-50" />
               </div>
               <div className="space-y-2">
                  <Label>Dernière rénovation</Label>
                  <Input type="date" value={dateRenov} onChange={e => setDateRenov(e.target.value)} className="bg-gray-50" />
               </div>
             </div>
          </div>

        </div>

        {/* Footer fixo */}
        <div className="p-4 border-t bg-white shrink-0">
            <Button onClick={handleSave} className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-medium text-lg">
                <Save className="size-5 mr-2" /> Enregistrer le recensement
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}