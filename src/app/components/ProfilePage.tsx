import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { User, Mobilier } from '@/app/types/mobilier';
import { User as UserIcon, Briefcase, MapPin, Calendar, BarChart3, MapPinned, Camera, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface ProfilePageProps {
  user: User;
  mobiliers: Mobilier[];
}

export function ProfilePage({ user, mobiliers }: ProfilePageProps) {
  const stats = useMemo(() => {
    const userMobiliers = mobiliers.filter((m) => m.agent === user.username);
    
    return {
      total: userMobiliers.length,
      withPhoto: userMobiliers.filter((m) => m.photo).length,
      critical: userMobiliers.filter((m) => m.criticite === 'urgent sécurité').length,
      toWatch: userMobiliers.filter((m) => m.criticite === 'à surveiller').length,
      byState: {
        neuf: userMobiliers.filter((m) => m.state === 'neuf').length,
        correct: userMobiliers.filter((m) => m.state === 'correct').length,
        endommagé: userMobiliers.filter((m) => m.state === 'endommagé').length,
        dangereux: userMobiliers.filter((m) => m.state === 'dangereux').length,
      },
      byGestionnaire: {
        MEL: userMobiliers.filter((m) => m.gestionnaire === 'MEL').length,
        commune: userMobiliers.filter((m) => m.gestionnaire === 'commune').length,
        inconnu: userMobiliers.filter((m) => m.gestionnaire === 'inconnu').length,
      },
    };
  }, [mobiliers, user.username]);

  const loginDate = new Date(user.loginDate);
  const roleLabel = user.role === 'agent-terrain' ? 'Agent Terrain' : 'Agent Bureau';
  const roleColor = user.role === 'agent-terrain' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300';
  const roleIcon = user.role === 'agent-terrain' ? <MapPin className="size-4" /> : <Briefcase className="size-4" />;

  return (
    <div className="h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profil utilisateur */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 bg-indigo-600 rounded-full flex items-center justify-center">
                  <UserIcon className="size-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="size-4" />
                    Connecté le {loginDate.toLocaleDateString('fr-FR')} à {loginDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`${roleColor} border flex items-center gap-1.5 px-3 py-1.5`}>
                {roleIcon}
                {roleLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-indigo-600" />
                  Permissions et accès
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className={`size-2 rounded-full mt-1.5 ${user.role === 'agent-terrain' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="font-medium">Recensement sur le terrain</div>
                      <div className="text-gray-500">Ajout de nouveau mobilier avec géolocalisation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className={`size-2 rounded-full mt-1.5 ${user.role === 'agent-bureau' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div>
                      <div className="font-medium">Raffinement des données</div>
                      <div className="text-gray-500">Ajout du distributeur, matériau, référence, dates</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="size-2 rounded-full mt-1.5 bg-green-500" />
                    <div>
                      <div className="font-medium">Consultation des données</div>
                      <div className="text-gray-500">Accès à la carte et à la liste complète</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="size-2 rounded-full mt-1.5 bg-green-500" />
                    <div>
                      <div className="font-medium">Export CSV</div>
                      <div className="text-gray-500">Téléchargement des données recensées</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-indigo-600" />
              Mes statistiques de recensement
            </CardTitle>
            <CardDescription>
              Résumé de votre activité de recensement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Statistiques globales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <MapPinned className="size-3.5" />
                    Total recensé
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{stats.withPhoto}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <Camera className="size-3.5" />
                    Avec photo
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">{stats.toWatch}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle className="size-3.5" />
                    À surveiller
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle className="size-3.5" />
                    Urgent sécurité
                  </div>
                </div>
              </div>

              <Separator />

              {/* Répartition par état */}
              <div>
                <h3 className="font-semibold mb-3">Répartition par état</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="text-2xl font-bold text-green-700">{stats.byState.neuf}</div>
                    <div className="text-sm text-gray-600">Neuf</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{stats.byState.correct}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">{stats.byState.endommagé}</div>
                    <div className="text-sm text-gray-600">Endommagé</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-red-50 border-red-200">
                    <div className="text-2xl font-bold text-red-700">{stats.byState.dangereux}</div>
                    <div className="text-sm text-gray-600">Dangereux</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Répartition par gestionnaire */}
              <div>
                <h3 className="font-semibold mb-3">Répartition par gestionnaire</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg bg-indigo-50 border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-700">{stats.byGestionnaire.MEL}</div>
                    <div className="text-sm text-gray-600">MEL</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-teal-50 border-teal-200">
                    <div className="text-2xl font-bold text-teal-700">{stats.byGestionnaire.commune}</div>
                    <div className="text-sm text-gray-600">Commune</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-gray-100 border-gray-300">
                    <div className="text-2xl font-bold text-gray-700">{stats.byGestionnaire.inconnu}</div>
                    <div className="text-sm text-gray-600">Inconnu</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Informations système</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Version de l'application:</span>
              <span className="font-medium">1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span>Total mobiliers dans la base:</span>
              <span className="font-medium">{mobiliers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Dernière synchronisation:</span>
              <span className="font-medium">Stockage local</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
