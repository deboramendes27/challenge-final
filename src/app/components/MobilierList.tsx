import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Filter, MapPin, Edit, CheckCircle, AlertCircle, Lock, Download } from 'lucide-react';
import { Mobilier, MobilierState, MobilierCategory, STATE_CONFIG, CATEGORY_LABELS, isCategorized } from '@/app/types/mobilier';
import { toast } from 'sonner';

interface MobilierListProps {
  mobiliers: Mobilier[];
  userRole?: 'terrain' | 'bureau';
  onEdit?: (mob: Mobilier) => void;
  nearbyMobiliers?: Mobilier[]; 
  onMobilierClick?: (mob: Mobilier) => void;
}

export function MobilierList({ mobiliers, userRole = 'terrain', onEdit, nearbyMobiliers = [], onMobilierClick }: MobilierListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MobilierCategory | 'all'>('all');
  const [filterState, setFilterState] = useState<MobilierState | 'all'>('all');
  const [filterProcessing, setFilterProcessing] = useState<'all' | 'done' | 'todo'>('all');
  
  const filteredMobiliers = mobiliers.filter((mob) => {
    const matchesSearch = 
        mob.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        mob.agent.toLowerCase().includes(searchTerm.toLowerCase());
        
    const matchesCategory = filterCategory === 'all' || mob.category === filterCategory;
    const matchesState = filterState === 'all' || mob.state === filterState;
    
    let matchesProcessing = true;
    if (userRole === 'bureau') {
        const isValid = isCategorized(mob);
        if (filterProcessing === 'done') matchesProcessing = isValid;
        if (filterProcessing === 'todo') matchesProcessing = !isValid;
    }

    return matchesSearch && matchesCategory && matchesState && matchesProcessing;
  });

  // --- EXPORTAÇÃO CSV (Volta para Vírgula + Correção de Acentos) ---
  const handleExportCSV = () => {
    if (filteredMobiliers.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Voltamos para VÍRGULA, que é o padrão universal de CSV
    const SEP = ","; 

    const headers = [
      "ID", 
      "Type", 
      "Catégorie", 
      "État", 
      "Latitude", 
      "Longitude", 
      "Agent", 
      "Date", 
      "Gestionnaire", 
      "Criticité",
      "Distributeur",
      "Réf.",
      "Commentaire"
    ];

    const rows = filteredMobiliers.map(m => {
        const mobAny = m as any;
        
        // Limpeza rigorosa para evitar quebras no Excel
        const clean = (text: any) => {
            if (!text) return "";
            // Substitui aspas duplas por aspas simples para não quebrar o CSV
            // Remove quebras de linha do texto
            return String(text).replace(/"/g, "'").replace(/(\r\n|\n|\r)/gm, " ").trim();
        };

        return [
            m.id,
            clean(m.type),
            clean(CATEGORY_LABELS[m.category] || m.category),
            clean(STATE_CONFIG[m.state]?.label || m.state),
            m.latitude, // Mantém ponto para coordenadas (padrão GPS)
            m.longitude,
            clean(m.agent),
            new Date(m.dateRecensement).toLocaleDateString(),
            clean(m.gestionnaire),
            clean(m.criticite),
            clean(mobAny.distributeur),
            clean(mobAny.reference),
            clean(m.commentaire)
        ].map(field => `"${field}"`).join(SEP); // Envolve em aspas para proteger virgulas internas
    });

    // Adiciona o BOM (\uFEFF) para forçar o Excel a ler como UTF-8 (corrige acentos)
    const csvContent = "\uFEFF" + [headers.join(SEP), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export_mobilier_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${filteredMobiliers.length} éléments exportés !`);
  };

  return (
    <Card className="h-full flex flex-col shadow-none border-0 bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4 shrink-0">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <CardTitle className="text-xl font-bold text-gray-800">Liste Globale</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 bg-white border-gray-300 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <Button variant="outline" className="bg-white border-gray-300 shadow-sm text-gray-700" onClick={handleExportCSV}>
                <Download className="size-4 mr-2" /> CSV
             </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
           <Select value={filterCategory} onValueChange={(v: any) => setFilterCategory(v)}>
            <SelectTrigger className="w-[200px] bg-white border-gray-300 text-gray-700 shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-[300px]">
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterState} onValueChange={(v: any) => setFilterState(v)}>
            <SelectTrigger className="w-[180px] bg-white border-gray-300 text-gray-700 shadow-sm">
              <SelectValue placeholder="État Physique" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Tous les états</SelectItem>
              {Object.entries(STATE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {userRole === 'bureau' && (
            <Select value={filterProcessing} onValueChange={(v: any) => setFilterProcessing(v)}>
                <SelectTrigger className="w-[180px] border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm">
                   <SelectValue placeholder="Statut Traitement" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                   <SelectItem value="all">Tout voir</SelectItem>
                   <SelectItem value="todo">⚠️ À Traiter</SelectItem>
                   <SelectItem value="done">✅ Catégorisé</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-0 pb-20 overflow-y-auto"> 
        <div className="space-y-3">
          {filteredMobiliers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                Aucun résultat trouvé.
            </div>
          ) : (
            filteredMobiliers.map((mob) => {
               const isValid = isCategorized(mob);
               
               let canEdit = false;
               let editTooltip = "";
               
               if (userRole === 'bureau') {
                   canEdit = true;
                   editTooltip = "Modifier les données techniques";
               } else {
                   const isNearby = nearbyMobiliers.some(m => m.id === mob.id);
                   canEdit = isNearby;
                   editTooltip = isNearby ? "Modifier (Vous êtes à proximité)" : "Trop loin pour modifier";
               }

               const stateInfo = STATE_CONFIG[mob.state] || { label: mob.state, color: 'text-gray-500', bgColor: 'bg-gray-100' };

               return (
                <div 
                  key={mob.id} 
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onMobilierClick && onMobilierClick(mob)}
                >
                  <div className="w-full sm:w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0 relative group border">
                    {mob.photo ? (
                      <img src={mob.photo} alt={mob.type} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sans photo</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg capitalize">{mob.type}</h4>
                        <p className="text-xs text-gray-500">{CATEGORY_LABELS[mob.category] || 'Non catégorisé'}</p>
                      </div>
                      
                      {userRole === 'bureau' && (
                        <div className="shrink-0 ml-2">
                           {isValid ? (
                             <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                <CheckCircle className="size-3 mr-1"/> Complet
                             </Badge>
                           ) : (
                             <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                <AlertCircle className="size-3 mr-1"/> À faire
                             </Badge>
                           )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      <span className={`px-2 py-0.5 rounded border font-medium ${stateInfo.bgColor} ${stateInfo.color}`}>
                        {stateInfo.label}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1 border px-2 rounded bg-gray-50">
                        <MapPin className="size-3" />
                        {mob.latitude.toFixed(5)}, {mob.longitude.toFixed(5)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 pt-1">
                        Agent: {mob.agent} • {new Date(mob.dateRecensement).toLocaleDateString()}
                    </div>
                  </div>

                  {onEdit && (
                    <div className="flex items-center pl-2 border-l sm:ml-2" title={editTooltip}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={!canEdit}
                            className={canEdit ? "text-indigo-600 hover:bg-indigo-50" : "text-gray-300 cursor-not-allowed"}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (canEdit) onEdit(mob); 
                            }}
                        >
                            {canEdit ? <Edit className="size-5" /> : <Lock className="size-5" />}
                        </Button>
                    </div>
                  )}
                </div>
               );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}