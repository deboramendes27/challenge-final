import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Search, Filter, Download, MapPin, Image } from 'lucide-react';
import { Mobilier, MobilierState, MobilierCategory, STATE_CONFIG, CATEGORY_LABELS } from '@/app/types/mobilier';
import { MobilierDetailDialog } from '@/app/components/MobilierDetailDialog';

interface MobilierListProps {
  mobiliers: Mobilier[];
  onMobilierClick?: (mobilier: Mobilier) => void;
}

export function MobilierList({ mobiliers, onMobilierClick }: MobilierListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<MobilierCategory | 'all'>('all');
  const [filterState, setFilterState] = useState<MobilierState | 'all'>('all');
  const [filterGestionnaire, setFilterGestionnaire] = useState<'all' | 'MEL' | 'commune' | 'inconnu'>('all');
  const [selectedMobilier, setSelectedMobilier] = useState<Mobilier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredMobiliers = mobiliers.filter((mob) => {
    const matchesSearch = 
      mob.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mob.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mob.agent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || mob.category === filterCategory;
    const matchesState = filterState === 'all' || mob.state === filterState;
    const matchesGestionnaire = filterGestionnaire === 'all' || mob.gestionnaire === filterGestionnaire;

    return matchesSearch && matchesCategory && matchesState && matchesGestionnaire;
  });

  const stats = {
    total: mobiliers.length,
    neuf: mobiliers.filter(m => m.state === 'neuf').length,
    correct: mobiliers.filter(m => m.state === 'correct').length,
    endommagé: mobiliers.filter(m => m.state === 'endommagé').length,
    dangereux: mobiliers.filter(m => m.state === 'dangereux').length,
  };

  const exportData = () => {
    const csv = [
      ['ID', 'Type', 'Catégorie', 'État', 'Latitude', 'Longitude', 'Gestionnaire', 'Criticité', 'Agent', 'Date', 'Commentaire'].join(';'),
      ...mobiliers.map(m => [
        m.id,
        m.type,
        CATEGORY_LABELS[m.category],
        STATE_CONFIG[m.state].label,
        m.latitude,
        m.longitude,
        m.gestionnaire,
        m.criticite,
        m.agent,
        new Date(m.dateRecensement).toLocaleString('fr-FR'),
        m.commentaire || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recensement_mobilier_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mobiliers recensés ({filteredMobiliers.length})</span>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Exporter CSV
          </Button>
        </CardTitle>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 p-2 rounded text-center">
            <div className="text-2xl font-bold text-green-700">{stats.neuf}</div>
            <div className="text-xs text-gray-600">Neuf</div>
          </div>
          <div className="bg-blue-50 p-2 rounded text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.correct}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="bg-orange-50 p-2 rounded text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.endommagé}</div>
            <div className="text-xs text-gray-600">Endommagé</div>
          </div>
          <div className="bg-red-50 p-2 rounded text-center">
            <div className="text-2xl font-bold text-red-700">{stats.dangereux}</div>
            <div className="text-xs text-gray-600">Dangereux</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {/* Filtres */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as MobilierCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState} onValueChange={(val) => setFilterState(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous états</SelectItem>
                {(Object.keys(STATE_CONFIG) as MobilierState[]).map((state) => (
                  <SelectItem key={state} value={state}>
                    {STATE_CONFIG[state].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterGestionnaire} onValueChange={(val) => setFilterGestionnaire(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Gestionnaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous gestionnaires</SelectItem>
                <SelectItem value="MEL">MEL</SelectItem>
                <SelectItem value="commune">Commune</SelectItem>
                <SelectItem value="inconnu">Inconnu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredMobiliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun mobilier recensé pour le moment
            </div>
          ) : (
            filteredMobiliers.map((mob) => {
              const stateConfig = STATE_CONFIG[mob.state];
              return (
                <div
                  key={mob.id}
                  className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedMobilier(mob);
                    setDialogOpen(true);
                    onMobilierClick?.(mob);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{mob.type}</h4>
                      <p className="text-sm text-gray-600 truncate">
                        {CATEGORY_LABELS[mob.category]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mob.photo && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Image className="size-4" />
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded text-xs border ${stateConfig.bgColor}`}>
                        <span className={stateConfig.color}>{stateConfig.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{mob.gestionnaire}</Badge>
                    <Badge variant={mob.criticite === 'urgent sécurité' ? 'destructive' : 'secondary'}>
                      {mob.criticite}
                    </Badge>
                    <span className="text-gray-500 flex items-center gap-1">
                      <MapPin className="size-3" />
                      {mob.latitude.toFixed(5)}, {mob.longitude.toFixed(5)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Par {mob.agent} • {new Date(mob.dateRecensement).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(mob.dateRecensement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {mob.commentaire && (
                    <p className="mt-2 text-sm text-gray-600 italic line-clamp-2">
                      {mob.commentaire}
                    </p>
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