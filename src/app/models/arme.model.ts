export interface ArmeModel {
  identifiant: number;
  nom: string;
  personnage: string;
  rang: number;
  niveauMax: number;
  groupeCompetencesDerivees: string;
  prixAchat: number;
  prixVente: number;
  acquisition: string;
  catalyste: string;
  forceMin: number;
  forceMax: number;
  forceIncrement: number;
  magieMin: number;
  magieMax: number;
  magieIncrement: number;
  experienceBase: number;
  experienceIncrement: number;
}