import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Map, Briefcase, LogIn, Lock, User as UserIcon } from 'lucide-react';
import { User } from '@/app/types/mobilier';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'agent-terrain' | 'agent-bureau'>('agent-terrain');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Estado para a senha

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação simples: só entra se tiver usuário E senha
    if (!username.trim() || !password.trim()) return;

    const user: User = {
      username,
      role: selectedRole,
      loginDate: new Date().toISOString()
    };
    
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto size-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
             <Map className="text-white size-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Recensement MEL</CardTitle>
          <p className="text-sm text-gray-500">Acesso para coleta e gestão</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* SELEÇÃO DE PERFIL */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('agent-terrain')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'agent-terrain'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Map className="size-6 mb-2" />
                <span>Terrain</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('agent-bureau')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'agent-bureau'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="size-6 mb-2" />
                <span>Bureau</span>
              </button>
            </div>

            {/* INPUTS DE LOGIN */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                    <UserIcon className="size-4" /> 
                    Identifiant ({selectedRole === 'agent-terrain' ? 'Terrain' : 'Bureau'})
                </Label>
                <Input 
                  id="username" 
                  placeholder="Ex: agent01" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* CAMPO DE SENHA RESTAURADO */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="size-4" /> 
                    Mot de passe
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-lg">
              <LogIn className="mr-2 size-5" /> 
              Entrer comme {selectedRole === 'agent-terrain' ? 'Terrain' : 'Bureau'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}