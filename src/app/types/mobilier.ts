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
  photo?: string; // Base64 encoded image or data URL
  dateRecensement: string;
  agent: string;
}

export const MOBILIER_TYPES: MobilierType[] = [
  // 1. Repos et Confort
  { id: 'banc-dossier', label: 'Bancs publics (avec dossier)', category: 'repos-confort' },
  { id: 'banquette', label: 'Banquettes (sans dossier)', category: 'repos-confort' },
  { id: 'assis-debout', label: 'Assis-debout', category: 'repos-confort' },
  { id: 'chaise-fauteuil', label: 'Chaises et fauteuils urbains', category: 'repos-confort' },
  { id: 'table-pique-nique', label: 'Tables de pique-nique', category: 'repos-confort' },
  { id: 'table-jeux', label: 'Tables de jeux (échecs, ping-pong)', category: 'repos-confort' },
  { id: 'transat', label: 'Transats urbains', category: 'repos-confort' },
  { id: 'plateforme-bois', label: 'Plateformes de bois (decks)', category: 'repos-confort' },

  // 2. Propreté et Hygiène
  { id: 'corbeille', label: 'Corbeilles de rue', category: 'proprete-hygiene' },
  { id: 'corbeille-tri', label: 'Corbeilles de tri sélectif', category: 'proprete-hygiene' },
  { id: 'cendrier', label: 'Cendriers urbains', category: 'proprete-hygiene' },
  { id: 'sanisette', label: 'Sanisettes (toilettes publiques)', category: 'proprete-hygiene' },
  { id: 'urinoir', label: 'Urinoirs', category: 'proprete-hygiene' },
  { id: 'distributeur-sacs', label: 'Distributeurs de sacs canins', category: 'proprete-hygiene' },
  { id: 'colonne-apport', label: 'Colonnes d\'apport volontaire', category: 'proprete-hygiene' },

  // 3. Information et Publicité
  { id: 'abribus', label: 'Abribus / Abris-voyageurs', category: 'information-publicite' },
  { id: 'colonne-morris', label: 'Colonnes Morris', category: 'information-publicite' },
  { id: 'planimetre', label: 'Planimètres', category: 'information-publicite' },
  { id: 'panneau-affichage-libre', label: 'Panneaux d\'affichage libre', category: 'information-publicite' },
  { id: 'ecran-numerique', label: 'Écrans numériques', category: 'information-publicite' },
  { id: 'table-orientation', label: 'Tables d\'orientation', category: 'information-publicite' },
  { id: 'pupitre-touristique', label: 'Pupitres touristiques', category: 'information-publicite' },

  // 4. Mobilité et Transport
  { id: 'poteau-arret', label: 'Poteaux d\'arrêt (bus, tramway)', category: 'mobilite-transport' },
  { id: 'borne-info-voyageur', label: 'Bornes d\'information voyageur', category: 'mobilite-transport' },
  { id: 'station-velo-libre', label: 'Stations de vélos en libre-service', category: 'mobilite-transport' },
  { id: 'arceau-velo', label: 'Arceaux et racks à vélos', category: 'mobilite-transport' },
  { id: 'abri-velo', label: 'Abris vélos sécurisés', category: 'mobilite-transport' },
  { id: 'borne-recharge-velo', label: 'Bornes de recharge véhicules électriques', category: 'mobilite-transport' },
  { id: 'horodateur', label: 'Horodateurs', category: 'mobilite-transport' },

  // 5. Sécurité et Délimitation
  { id: 'potelet', label: 'Potelets et bornes anti-stationnement', category: 'securite-delimitation' },
  { id: 'barriere-ville', label: 'Barrières de ville', category: 'securite-delimitation' },
  { id: 'garde-corps', label: 'Garde-corps', category: 'securite-delimitation' },
  { id: 'miroir-circulation', label: 'Miroirs de circulation', category: 'securite-delimitation' },
  { id: 'borne-incendie', label: 'Bornes incendie', category: 'securite-delimitation' },

  // 6. Éclairage et Réseaux
  { id: 'candelabre', label: 'Candélabres (lampadaires)', category: 'eclairage-reseaux' },
  { id: 'mat-eclairage', label: 'Mâts d\'éclairage', category: 'eclairage-reseaux' },
  { id: 'borne-lumineuse', label: 'Bornes lumineuses', category: 'eclairage-reseaux' },
  { id: 'projecteur', label: 'Projecteurs d\'illumination', category: 'eclairage-reseaux' },
  { id: 'armoire-electrique', label: 'Armoires électriques', category: 'eclairage-reseaux' },
  { id: 'coffret-technique', label: 'Coffrets techniques', category: 'eclairage-reseaux' },

  // 7. Végétalisation et Agrément
  { id: 'jardiniere', label: 'Jardinières et bacs à fleurs', category: 'vegetalisation-agrement' },
  { id: 'grille-arbre', label: 'Grilles d\'arbres', category: 'vegetalisation-agrement' },
  { id: 'corset-protection', label: 'Corsets de protection', category: 'vegetalisation-agrement' },
  { id: 'fontaine-wallace', label: 'Fontaines Wallace', category: 'vegetalisation-agrement' },
  { id: 'fontaine-boire', label: 'Fontaines à boire', category: 'vegetalisation-agrement' },
  { id: 'bassin', label: 'Bassins et miroirs d\'eau', category: 'vegetalisation-agrement' },
  { id: 'sculpture', label: 'Sculptures et œuvres d\'art', category: 'vegetalisation-agrement' },

  // 8. Nouveaux Usages (Smart et Santé)
  { id: 'borne-wifi', label: 'Bornes Wi-Fi publiques', category: 'nouveaux-usages' },
  { id: 'totem-recharge-usb', label: 'Totems de recharge USB', category: 'nouveaux-usages' },
  { id: 'station-reparation-velo', label: 'Stations de gonflage/réparation vélos', category: 'nouveaux-usages' },
  { id: 'module-fitness', label: 'Modules de fitness urbain', category: 'nouveaux-usages' },
  { id: 'brumisateur', label: 'Brumisateurs', category: 'nouveaux-usages' },
];

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

export const STATE_CONFIG: Record<MobilierState, { label: string; color: string; bgColor: string }> = {
  neuf: {
    label: 'Neuf',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
  },
  correct: {
    label: 'Correct',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300',
  },
  endommagé: {
    label: 'Endommagé',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300',
  },
  dangereux: {
    label: 'Dangereux',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
  },
};