export type MobilierState = 'neuf' | 'correct' | 'endommagé' | 'dangereux';

export type MobilierCategory = 
  | 'repos-confort'
  | 'proprete-hygiene'
  | 'information-publicite'
  | 'mobilite-transport'
  | 'securite-delimitation'
  | 'eclairage-reseaux'
  | 'vegetalisation-agrement'
  | 'nouveaux-usages';

export interface MobilierType {
  id: string;
  label: string;
  category: MobilierCategory;
}

export interface Mobilier {
  id: string;
  type: string;
  category: MobilierCategory;
  state: MobilierState;
  latitude: number;
  longitude: number;
  gestionnaire: 'MEL' | 'commune' | 'inconnu';
  criticite: 'OK' | 'à surveiller' | 'urgent sécurité';
  commentaire?: string;
  photo?: string;
  dateRecensement: string;
  agent: string;
  
  // NOVOS CAMPOS BUREAU
  distributeur?: string;
  description_technique?: string;
}

// FUNÇÃO ESSENCIAL (Se faltar isso, a tela fica branca)
export function isCategorized(mob: Mobilier): boolean {
  return !!(mob.distributeur && mob.distributeur.trim() !== '' && 
            mob.description_technique && mob.description_technique.trim() !== '');
}

export const STATE_CONFIG: Record<MobilierState, { label: string; color: string; bgColor: string }> = {
  neuf: { label: 'Neuf / Excellent', color: 'text-green-700', bgColor: 'bg-green-100' },
  correct: { label: 'Bon État', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  endommagé: { label: 'Endommagé', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  dangereux: { label: 'Dangereux', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// ... (Pode manter o MOBILIER_TYPES e CATEGORY_LABELS que já estavam lá)
export const CATEGORY_LABELS: Record<MobilierCategory, string> = {
  'repos-confort': '1. Repos et Confort',
  'proprete-hygiene': '2. Propreté et Hygiène',
  'information-publicite': '3. Information et Publicité',
  'mobilite-transport': '4. Mobilité et Transport',
  'securite-delimitation': '5. Sécurité et Délimitation',
  'eclairage-reseaux': '6. Éclairage et Réseaux',
  'vegetalisation-agrement': '7. Végétalisation et Agrément',
  'nouveaux-usages': '8. Nouveaux Usages (Smart et Santé)',
};

export const MOBILIER_TYPES: MobilierType[] = [
  { id: 'banc-dossier', label: 'Bancs publics', category: 'repos-confort' },
  { id: 'corbeille', label: 'Corbeille / Poubelle', category: 'proprete-hygiene' },
  { id: 'lampadaire', label: 'Lampadaire', category: 'eclairage-reseaux' },
  { id: 'potelet', label: 'Potelet', category: 'securite-delimitation' },
  // ... adicione os outros se quiser
];