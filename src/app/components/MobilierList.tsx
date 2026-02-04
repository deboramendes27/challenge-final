import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Filter, MapPin, Edit, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Mobilier, MobilierState, MobilierCategory, STATE_CONFIG, CATEGORY_LABELS, isCategorized } from '@/app/types/mobilier';
import { MobilierDetailDialog } from '@/app/components/MobilierDetailDialog';

interface MobilierListProps {
  mobiliers: Mobilier[];
  userRole?: 'terrain' | 'bureau';
  onEdit?: (mob: Mobilier) => void;
  nearbyMobiliers?: Mobilier[]; 
}

export function MobilierList({ mobiliers, userRole = 'terrain', onEdit, nearbyMobiliers = [] }: MobilierListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MobilierCategory | 'all'>('all');
  const [filterState, setFilterState] = useState<MobilierState | 'all'>('all');
  const [filterProcessing, setFilterProcessing] = useState<'all' | 'done' | 'todo'>('all');
  
  const [selectedMobilier, setSelectedMobilier] = useState<Mobilier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredMobiliers = mobiliers.filter((mob) => {
    const matchesSearch = mob.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mob.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || mob.category === filterCategory;
    const matchesState = filterState === 'all' || mob.state === filterState;
    
    let matchesProcessing = true;
    if (userRole === 'bureau') {
        if (filterProcessing === 'done') matchesProcessing = isCategorized(mob);
        if (filterProcessing === 'todo') matchesProcessing = !isCategorized(mob);
    }

    return matchesSearch && matchesCategory && matchesState && matchesProcessing;
  });

  return (
    <Card className="h-full flex flex-col shadow-none border-0 bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <CardTitle className="text-xl font-bold">Liste Globale</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
           <Select value={filterCategory} onValueChange={(v: any) => setFilterCategory(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterState} onValueChange={(v: any) => setFilterState(v)}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="État Physique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les états</SelectItem>
              {Object.entries(STATE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {userRole === 'bureau' && (
            <Select value={filterProcessing} onValueChange={(v: any) => setFilterProcessing(v)}>
                <SelectTrigger className="w-[180px] border-emerald-200 bg-emerald-50 text-emerald-900">
                <SelectValue placeholder="Statut Traitement" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Tout voir</SelectItem>
                <SelectItem value="todo">⚠️ À Traiter</SelectItem>
                <SelectItem value="done">✅ Catégorisé</SelectItem>
                </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-0 pb-20"> 
        <div className="space-y-3">
          {filteredMobiliers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">Aucun résultat trouvé.</div>
          ) : (
            filteredMobiliers.map((mob) => {
               const isCat = isCategorized(mob);
               
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

               return (
                <div 
                  key={mob.id} 
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div 
                    className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0 cursor-pointer relative group"
                    onClick={() => { setSelectedMobilier(mob); setDialogOpen(true); }}
                  >
                    {mob.photo ? (
                      <img src={mob.photo} alt={mob.type} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sans photo</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{mob.type}</h4>
                        <p className="text-xs text-gray-500">{CATEGORY_LABELS[mob.category]}</p>
                      </div>
                      
                      {userRole === 'bureau' && (
                        <div className="shrink-0 ml-2">
                           {isCat ? (
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
                      <span className={`px-2 py-0.5 rounded border ${STATE_CONFIG[mob.state].bgColor} ${STATE_CONFIG[mob.state].color}`}>
                        {STATE_CONFIG[mob.state].label}
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
                    <div className="flex items-center pl-2 border-l" title={editTooltip}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={!canEdit}
                            className={canEdit ? "text-indigo-600 hover:bg-indigo-50" : "text-gray-300 cursor-not-allowed"}
                            onClick={() => { if (canEdit) onEdit(mob); }}
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
      
      <MobilierDetailDialog 
        mobilier={selectedMobilier}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}