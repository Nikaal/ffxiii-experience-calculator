export interface MateriauModel {
  identifiant: number;
  nom: string;
  multiplicateur: string;
  rang: number;
  acquisition: string;
  prixAchat: number;
  prixVente: number;
  experienceRang: number[]; // tableau des expériences de rang 1 à 11
}