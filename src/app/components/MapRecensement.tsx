import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Mobilier, STATE_CONFIG, isCategorized } from '@/app/types/mobilier';
import { Button } from '@/app/components/ui/button';
import { Navigation, Edit, Lock } from 'lucide-react';
import L from 'leaflet';

// Imports de ícones do Leaflet (Isso evita o bug dos ícones invisíveis)
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapRecensementProps {
  mobiliers: Mobilier[];
  currentPosition: { lat: number; lng: number } | null;
  nearbyMobiliers?: Mobilier[];
  onMarkerClick?: (mob: Mobilier) => void;
  userRole?: 'terrain' | 'bureau';
}

function RecenterMap({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 16);
  }, [position, map]);
  return null;
}

export function MapRecensement({ mobiliers, currentPosition, onMarkerClick, nearbyMobiliers = [], userRole = 'terrain' }: MapRecensementProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const getMarkerIcon = (color: string) => {
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
        <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`;
    
    return L.divIcon({
      className: 'custom-pin',
      html: `<div style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">${svgIcon}</div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -45]
    });
  };

  if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Chargement...</div>;

  // --- MUDANÇA IMPORTANTE AQUI EMBAIXO ---
  // Removido 'z-0' e adicionado 'isolate' para garantir interatividade correta
  return (
    <div className="w-full h-full relative isolate">
      <MapContainer 
        center={currentPosition || [50.6292, 3.0573]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }} // Garante z-index positivo
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* Recentraliza o mapa se a posição mudar */}
        <RecenterMap position={currentPosition} />

        {currentPosition && (
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={
             L.divIcon({ className: 'bg-blue-600 rounded-full border-2 border-white shadow-xl', iconSize: [16, 16] })
          }>
             <Popup>Vous êtes ici</Popup>
          </Marker>
        )}

        {mobiliers.map((mob) => {
           let color = '#3b82f6'; 
           if (userRole === 'bureau') {
             color = isCategorized(mob) ? '#16a34a' : '#f97316';
           } else {
             if (mob.state === 'dangereux') color = '#dc2626';
             else if (mob.state === 'endommagé') color = '#f97316';
             else if (mob.state === 'neuf') color = '#16a34a';
             else color = '#2563eb';
           }

           let canEdit = false;
           if (userRole === 'bureau') canEdit = true;
           else if (userRole === 'terrain') {
               canEdit = nearbyMobiliers.some(m => m.id === mob.id);
           }

           return (
             <Marker 
               key={mob.id} 
               position={[mob.latitude, mob.longitude]}
               icon={getMarkerIcon(color)}
               eventHandlers={{
                 click: () => {
                     // No bureau, clique já edita. No terrain, apenas abre popup.
                     if (userRole === 'bureau' && onMarkerClick) onMarkerClick(mob);
                 }
               }}
             >
               <Popup>
                 <div className="text-sm min-w-[200px]">
                   <strong className="block mb-1 text-base">{mob.type}</strong>
                   <div className="mb-2">
                     <span className={`px-2 py-0.5 rounded text-white text-xs inline-block ${
                        mob.state === 'dangereux' ? 'bg-red-600' :
                        mob.state === 'endommagé' ? 'bg-orange-500' : 
                        mob.state === 'neuf' ? 'bg-green-600' : 'bg-blue-500'
                     }`}>
                       {STATE_CONFIG[mob.state]?.label || mob.state}
                     </span>
                   </div>
                   
                   {userRole === 'bureau' && (
                      <div className="text-xs text-gray-600 mb-2 border-t pt-2 mt-2">
                        {isCategorized(mob) 
                          ? <span className="text-green-700 font-bold">✓ Catégorisé</span> 
                          : <span className="text-orange-600 font-bold">⚠ À traiter</span>}
                      </div>
                   )}

                   {mob.photo && <img src={mob.photo} className="w-full h-24 object-cover rounded mb-2 border" />}

                   {onMarkerClick && (
                      <Button 
                          size="sm" 
                          disabled={!canEdit}
                          className={`w-full mt-1 ${canEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          onClick={() => { if(canEdit) onMarkerClick(mob); }}
                      >
                          {canEdit ? (
                              <><Edit className="size-3 mr-2" /> Modifier</>
                          ) : (
                              <><Lock className="size-3 mr-2" /> Trop loin</>
                          )}
                      </Button>
                   )}
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[500]">
         <Button size="sm" variant="secondary" className="shadow-md bg-white hover:bg-gray-100 text-black" onClick={() => {
            const map = document.querySelector('.leaflet-container');
            if (map) (map as any)._leaflet_map.flyTo(currentPosition || [50.6292, 3.0573], 15);
         }}>
           <Navigation className="size-4 mr-2" /> Centrer
         </Button>
      </div>
    </div>
  );
}