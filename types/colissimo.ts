export interface Colis {
  id?: string;
  code?: string;
  reference?: string;
  client: string;
  adresse: string;
  ville: string;
  gouvernorat: string;
  tel1: string;
  tel2?: string;
  designation: string;
  prix: number;
  nb_pieces: number;
  type: 'VO' | 'EC' | 'DO';
  commentaire?: string;
  echange: 0 | 1;
  echange_lie?: string | null;
  cod?: number;
  poids?: number;
  date_creation?: string;
  statut?: string;
  etat?: string;
  numero_colis?: string;
  agence_actuelle?: string;
  num_manifeste?: number;
  num_paiement?: string;
  anomalie?: string;
  cause_anomalie?: string;
}

export interface ColisFormData {
  reference: string;
  client: string;
  adresse: string;
  ville: string;
  gouvernorat: string;
  tel1: string;
  tel2?: string;
  designation: string;
  prix: number;
  nb_pieces: number;
  type: 'VO' | 'EC' | 'DO';
  commentaire?: string;
  echange: 0 | 1;
  cod?: number;
  poids?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListeColisResponse {
  colis: Colis[];
  total: number;
  page: number;
}

