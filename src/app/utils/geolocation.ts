import { Mobilier } from '@/app/types/mobilier';

/**
 * Calcule la distance entre deux points GPS en mètres
 * Utilise la formule de Haversine
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
}

/**
 * Trouve les mobiliers dans un rayon donné (en mètres) autour d'une position
 */
export function findNearbyMobiliers(
  mobiliers: Mobilier[],
  latitude: number,
  longitude: number,
  radiusMeters: number = 10
): Mobilier[] {
  return mobiliers.filter((mobilier) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      mobilier.latitude,
      mobilier.longitude
    );
    return distance <= radiusMeters;
  });
}

/**
 * Trouve les doublons potentiels : mobiliers du même type dans un rayon donné
 */
export function findPotentialDuplicates(
  mobiliers: Mobilier[],
  latitude: number,
  longitude: number,
  mobilierType: string,
  radiusMeters: number = 10
): Mobilier[] {
  return mobiliers.filter((mobilier) => {
    if (mobilier.type !== mobilierType) return false;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      mobilier.latitude,
      mobilier.longitude
    );
    return distance <= radiusMeters;
  });
}
