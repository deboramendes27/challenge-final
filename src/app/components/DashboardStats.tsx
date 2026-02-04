import { Card, CardContent } from '@/app/components/ui/card';
import { Mobilier } from '@/app/types/mobilier';
import { AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

interface DashboardStatsProps {
  mobiliers: Mobilier[];
}

export function DashboardStats({ mobiliers }: DashboardStatsProps) {
  const total = mobiliers.length;
  const dangerous = mobiliers.filter(m => m.state === 'dangereux').length;
  const good = mobiliers.filter(m => m.state === 'neuf' || m.state === 'correct').length;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Tableau de Bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Recensé</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{total}</h3>
              <p className="text-xs text-gray-400 mt-1">Éléments enregistrés</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MapPin className="size-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Attention */}
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Attention Requise</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">{dangerous}</h3>
              <p className="text-xs text-gray-400 mt-1">Signalés dangereux</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        {/* Bon État */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En Bon État</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">{good}</h3>
              <p className="text-xs text-gray-400 mt-1">Conformes / Neufs</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="size-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}