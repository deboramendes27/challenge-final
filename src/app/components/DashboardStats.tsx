import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Mobilier, STATE_CONFIG } from "@/app/types/mobilier";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, MapPin, Activity } from "lucide-react";

interface DashboardStatsProps {
  mobiliers: Mobilier[];
}

export function DashboardStats({ mobiliers }: DashboardStatsProps) {
  // 1. Cálculos de Contagem
  const total = mobiliers.length;
  const perigosos = mobiliers.filter(m => m.state === 'dangereux').length;
  const bons = mobiliers.filter(m => m.state === 'neuf' || m.state === 'correct').length;
  
  // 2. Agrupar por Tipo (Para o Gráfico)
  const dadosPorTipo = mobiliers.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

  return (
    <div className="space-y-6 p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold tracking-tight">Painel de Controle</h2>

      {/* CARDS DE RESUMO (Topo) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Identificado</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Itens registrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção Necessária</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{perigosos}</div>
            <p className="text-xs text-muted-foreground">Itens marcados como perigosos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Bom Estado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bons}</div>
            <p className="text-xs text-muted-foreground">Itens novos ou corretos</p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO E LISTA DETALHADA */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfico de Barras */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorTipo}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contagem */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contagem Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosPorTipo.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="ml-4 space-y-1 w-full">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <div className="w-full bg-secondary h-2 rounded-full mt-1">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(item.value / total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-auto font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}