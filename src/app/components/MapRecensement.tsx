import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Mobilier, STATE_CONFIG } from '@/app/types/mobilier';
import { Button } from '@/app/components/ui/button';
import { Navigation } from 'lucide-react';
import L from 'leaflet';

// Corrige ícones do Leaflet no React
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
}

function RecenterMap({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 16);
  }, [position, map]);
  return null;
}

export function MapRecensement({ mobiliers, currentPosition }: MapRecensementProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Carregando mapa...</div>;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={currentPosition || [50.6292, 3.0573]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {currentPosition && (
          <>
            <Marker position={[currentPosition.lat, currentPosition.lng]} icon={
                L.divIcon({
                    className: 'bg-blue-600 rounded-full border-2 border-white shadow-xl',
                    iconSize: [16, 16]
                })
            }>
               <Popup>Você está aqui</Popup>
            </Marker>
            <RecenterMap position={currentPosition} />
          </>
        )}

        {mobiliers.map((mob) => (
           <Marker key={mob.id} position={[mob.latitude, mob.longitude]}>
             <Popup>
               <div className="text-sm">
                 <strong className="block mb-1">{mob.type}</strong>
                 <span className={`px-2 py-0.5 rounded text-white text-xs ${
                     mob.state === 'dangereux' ? 'bg-red-600' :
                     mob.state === 'endommagé' ? 'bg-orange-500' : 'bg-green-600'
                 }`}>
                   {STATE_CONFIG[mob.state]?.label || mob.state}
                 </span>
                 {mob.photo && <img src={mob.photo} className="mt-2 w-full h-24 object-cover rounded" />}
               </div>
             </Popup>
           </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000]">
         <Button size="sm" variant="secondary" className="shadow-md">
           <Navigation className="size-4 mr-2" /> 
           Centrar
         </Button>
      </div>
    </div>
  );
}
