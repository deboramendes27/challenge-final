import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Mobilier, MobilierState, CATEGORY_LABELS, STATE_CONFIG } from '@/app/types/mobilier';
import { Save, ShieldCheck } from 'lucide-react';

interface BureauEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobilier: Mobilier | null;
  onSave: (mobilier: Mobilier) => void;
}

export function BureauEditSheet({ open, onOpenChange, mobilier, onSave }: BureauEditSheetProps) {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState<MobilierState>('correct');
  const [gestionnaire, setGestionnaire] = useState('');
  const [criticite, setCriticite] = useState('');
  const [comment, setComment] = useState('');
  
  // CAMPOS DE VALIDAÇÃO (Exclusivos Bureau)
  const [distributeur, setDistributeur] = useState('');
  const [descTechnique, setDescTechnique] = useState(''); // O campo extra obrigatório
  
  const [reference, setReference] = useState('');
  const [dateInstall, setDateInstall] = useState('');

  useEffect(() => {
    if (mobilier && open) {
      setCategory(mobilier.category || '');
      setType(mobilier.type || '');
      setState(mobilier.state || 'correct');
      setGestionnaire(mobilier.gestionnaire || 'inconnu');
      setCriticite(mobilier.criticite || 'OK');
      setComment(mobilier.commentaire || '');
      
      const m = mobilier as any;
      setDistributeur(m.distributeur || '');
      setDescTechnique(m.description_technique || ''); // Carrega descrição técnica
      setReference(m.reference || '');
      setDateInstall(m.dateInstallation || '');
    }
  }, [mobilier, open]);

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
      // Salva os campos que definem a validação
      distributeur,
      description_technique: descTechnique,
      reference,
      dateInstallation: dateInstall,
    };
    onSave(updated);
  };

  if (!mobilier) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] bg-white border-l shadow-2xl flex flex-col p-0 z-[100]">
        
        <SheetHeader className="p-6 border-b shrink-0 bg-white">
          <SheetTitle className="flex items-center gap-2 text-indigo-700">
             <ShieldCheck className="size-5"/> Validation Bureau
          </SheetTitle>
          <SheetDescription>Édition: <span className="font-bold">{mobilier.type}</span></SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Données Générales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gray-50 w-full overflow-hidden"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10000] bg-white">
                        {Object.entries(CATEGORY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2"><Label>Type</Label><Input value={type} onChange={e => setType(e.target.value)} className="bg-gray-50" /></div>
            </div>
            
            <div className="space-y-2">
                <Label>État Physique</Label>
                <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(STATE_CONFIG) as MobilierState[]).map((s) => (
                        <button key={s} onClick={() => setState(s)}
                            className={`py-2 px-1 text-xs rounded border capitalize transition-colors ${state === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}>
                            {STATE_CONFIG[s].label.split(' / ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Gestionnaire</Label>
                    <Select value={gestionnaire} onValueChange={setGestionnaire}>
                    <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10000] bg-white">
                        <SelectItem value="MEL">MEL</SelectItem><SelectItem value="commune">Commune</SelectItem><SelectItem value="inconnu">Inconnu</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Criticité</Label>
                    <Select value={criticite} onValueChange={setCriticite}>
                    <SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10000] bg-white">
                        <SelectItem value="OK">OK</SelectItem><SelectItem value="à surveiller">À surveiller</SelectItem><SelectItem value="urgent sécurité">Urgent</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-blue-100 bg-blue-50/50 p-4 rounded-lg">
             <h3 className="font-bold text-blue-800 flex items-center gap-2"><ShieldCheck className="size-4"/> Validation Technique (Obligatoire)</h3>
             
             <div className="space-y-2">
                <Label className="text-blue-900 font-semibold">Distributeur</Label>
                <Input placeholder="Ex: JCDecaux" value={distributeur} onChange={e => setDistributeur(e.target.value)} className="bg-white border-blue-200" />
             </div>

             <div className="space-y-2">
                <Label className="text-blue-900 font-semibold">Description Technique / Matériau</Label>
                <Input placeholder="Détails techniques complets..." value={descTechnique} onChange={e => setDescTechnique(e.target.value)} className="bg-white border-blue-200" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Référence</Label><Input placeholder="#REF" value={reference} onChange={e => setReference(e.target.value)} className="bg-white" /></div>
                <div className="space-y-2"><Label>Date Install.</Label><Input type="date" value={dateInstall} onChange={e => setDateInstall(e.target.value)} className="bg-white" /></div>
             </div>
          </div>

          <div className="space-y-2 pt-2">
             <Label>Commentaire (Terrain)</Label>
             <Textarea value={comment} onChange={e => setComment(e.target.value)} className="bg-gray-50 min-h-[60px]" />
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                <Save className="size-4 mr-2" /> Valider
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}