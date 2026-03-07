export interface AccessoireModel {
  identifiant: number;
  nom: string;
  rang: number;
  niveauMax: number;
  proprieteSpeciale: string;
  groupeCompetencesDerivees: string;
  prixAchat: number;
  prixVente: number;
  acquisition: string;
  catalyste: string;
  min: number;
  max: number;
  increment: number;
  experienceBase: number;
  experienceIncrement: number;
}