import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Mobilier } from '@/app/types/mobilier';
import { Button } from '@/app/components/ui/button';
import { Edit, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import L from 'leaflet';

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
  useEffect(() => { if (position) map.flyTo([position.lat, position.lng], 16); }, [position, map]);
  return null;
}

export function MapRecensement({ mobiliers, currentPosition, onMarkerClick, nearbyMobiliers = [], userRole = 'terrain' }: MapRecensementProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const isValidated = (m: Mobilier) => {
    // Cast para 'any' pois os campos são novos no tipo
    const mob = m as any;
    return !!(mob.distributeur && mob.distributeur.trim() !== '' && 
              mob.description_technique && mob.description_technique.trim() !== '');
  };

  const getMarkerColor = (mob: Mobilier) => {
    if (userRole === 'bureau') {
      return isValidated(mob) ? '#16a34a' : '#f97316';
    } else {
      switch (mob.state) {
        case 'dangereux': return '#dc2626'; // Red
        case 'endommagé': return '#f97316'; // Orange
        case 'neuf': return '#16a34a';      // Green
        case 'correct':
        default: return '#2563eb';          // Blue
      }
    }
  };

  const getMarkerIcon = (color: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>`;
      
    return L.divIcon({
      className: 'custom-pin',
      html: `<div style="width: 32px; height: 42px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${svg}</div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -45]
    });
  };

  if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Chargement carte...</div>;

  return (
    <div className="w-full h-full relative isolate z-0">
      <MapContainer center={currentPosition || [50.6292, 3.0573]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <RecenterMap position={currentPosition} />
        
        {currentPosition && (
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={L.divIcon({ className: 'bg-blue-600 rounded-full border-2 border-white shadow-xl', iconSize: [16, 16] })}>
             <Popup>Vous êtes ici</Popup>
          </Marker>
        )}

        {mobiliers.map((mob) => {
           const color = getMarkerColor(mob);
           const canEdit = userRole === 'bureau' || (userRole === 'terrain' && nearbyMobiliers.some(m => m.id === mob.id));

           return (
             <Marker 
               key={mob.id} 
               position={[mob.latitude, mob.longitude]}
               icon={getMarkerIcon(color)}
               eventHandlers={{ click: () => { if (userRole === 'bureau' && onMarkerClick) onMarkerClick(mob); }}}
             >
               <Popup>
                 <div className="text-sm min-w-[200px] p-1">
                   <strong className="block mb-1 text-base capitalize">{mob.type}</strong>
                   <div className="flex flex-wrap gap-1 mb-2">
                     <span className="text-xs px-2 py-0.5 rounded bg-gray-100 border font-medium capitalize">
                        {mob.state}
                     </span>
                     {userRole === 'bureau' && (
                        isValidated(mob) 
                        ? <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"><CheckCircle className="size-3"/> Validé</span>
                        : <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1"><AlertTriangle className="size-3"/> À Traiter</span>
                     )}
                   </div>
                   {mob.photo && <img src={mob.photo} className="w-full h-24 object-cover rounded mb-2 border" />}
                   
                   {onMarkerClick && (
                      <Button size="sm" disabled={!canEdit} className={`w-full mt-1 h-8 ${canEdit ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-500'}`} onClick={() => { if(canEdit) onMarkerClick(mob); }}>
                          {canEdit ? <><Edit className="size-3 mr-2"/> Modifier</> : <><Lock className="size-3 mr-2"/> Trop loin</>}
                      </Button>
                   )}
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
      
      {/* LEGENDA - BUREAU */}
      {userRole === 'bureau' && (
         <div className="absolute bottom-6 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[500] text-xs space-y-1">
            <div className="font-bold mb-2">Légende (Validation)</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-green-600"></div> Validé (Complet)</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-orange-500"></div> À Traiter / Incomplet</div>
         </div>
      )}

      {/* LEGENDA - TERRAIN (NOVA) */}
      {userRole === 'terrain' && (
         <div className="absolute bottom-6 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[500] text-xs space-y-1">
            <div className="font-bold mb-2">Légende (État)</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-green-600"></div> Neuf</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-blue-600"></div> Correct</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-orange-500"></div> Endommagé</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-red-600"></div> Dangereux</div>
         </div>
      )}
    </div>
  );
}