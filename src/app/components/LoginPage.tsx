import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs'; // Importação essencial
import { Building2, Lock, User, Map as MapIcon, Briefcase } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, role: 'terrain' | 'bureau') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'terrain' | 'bureau'>('terrain');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username, role);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`size-16 rounded-full flex items-center justify-center transition-colors ${role === 'terrain' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              <Building2 className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Recensement MEL</CardTitle>
          <CardDescription>
            {role === 'terrain' ? 'Acesso para coleta em campo' : 'Acesso para gestão administrativa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* ABAS PARA ESCOLHER O TIPO DE AGENTE */}
          <Tabs defaultValue="terrain" onValueChange={(v) => setRole(v as 'terrain' | 'bureau')} className="mb-6 w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terrain">
                <MapIcon className="size-4 mr-2" /> Terrain
              </TabsTrigger>
              <TabsTrigger value="bureau">
                <Briefcase className="size-4 mr-2" /> Bureau
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant ({role === 'terrain' ? 'Terrain' : 'Bureau'})</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="username"
                  placeholder={role === 'terrain' ? "Ex: agent01" : "Ex: admin_mel"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className={`w-full ${role === 'terrain' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              Entrar como {role === 'terrain' ? 'Terrain' : 'Bureau'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}