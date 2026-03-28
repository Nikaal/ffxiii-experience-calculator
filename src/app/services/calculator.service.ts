import { Injectable } from '@angular/core';
import { ArmeModel } from '../models/arme.model';
import { AccessoireModel } from '../models/accessoire.model';
import { MateriauModel } from '../models/materiau.model';

interface MateriauOptimise {
  materiau: MateriauModel;
  nombre: number;
  cout: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  constructor() {}

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible
  calculerXpTotal(
    niveauActuel: number,
    niveauCible: number,
    base: number,
    increment: number,
  ): number {
    let xpTotal = 0;

    if (niveauCible == 1) return base;

    if (niveauActuel === 26) return 0;

    if (niveauActuel === niveauCible) return base + increment * (niveauActuel - 1);

    for (let lvl = niveauActuel; lvl < niveauCible; lvl++) {
      xpTotal += base + increment * (lvl - 1);
    }

    return xpTotal;
  }

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible d'une arme
  calculerXpArme(arme: ArmeModel, niveauActuel: number, niveauCible: number): number {
    return this.calculerXpTotal(
      niveauActuel,
      niveauCible,
      arme.experienceBase,
      arme.experienceIncrement,
    );
  }

  // Calcule la force de l'arme à un niveau spécifique
  calculerForceArme(arme: ArmeModel, niveau: number): number {
    if (niveau === 1) return arme.forceMin;
    else return arme.forceMin + arme.forceIncrement * (niveau - 1);
  }

  // Calcule la magie de l'arme à un niveau spécifique
  calculerMagieArme(arme: ArmeModel, niveau: number): number {
    if (niveau === 1) return arme.magieMin;
    else return arme.magieMin + arme.magieIncrement * (niveau - 1);
  }

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible d'un accessoire
  calculerXpAccessoire(
    accessoire: AccessoireModel,
    niveauActuel: number,
    niveauCible: number,
  ): number {
    return this.calculerXpTotal(
      niveauActuel,
      niveauCible,
      accessoire.experienceBase,
      accessoire.experienceIncrement,
    );
  }

  // Retourne le bonus multiplicateur selon le total de multiplicateur
  private getBonusMultiplicateur(totalMultiplicateur: number): number {
    if (totalMultiplicateur > 500) return 3;
    if (totalMultiplicateur > 250) return 2;
    if (totalMultiplicateur > 200) return 1.75;
    if (totalMultiplicateur > 100) return 1.5;
    if (totalMultiplicateur > 50) return 1.25;
    return 1;
  }

  // Calcule le nombre minimal d'exemplaires d'un matériau pour atteindre le bonus ×3
  getMateriauPourBonusMax(materiaux: MateriauModel[]): { materiau: MateriauModel; nombre: number; cout: number } {
    let best!: { materiau: MateriauModel; nombre: number; cout: number };

    for (const m of materiaux) {
      const mult = Number(m.multiplicateur) || 0;

      if (mult <= 0) continue; // on ignore les multiplicateurs négatifs
      if (m.prixAchat === 0) continue; // on ignore les matériaux qu'on ne peut pas acheter

      const nombre = Math.floor(501 / mult) + 1; // atteindre strictement >500
      const cout = nombre * m.prixAchat;

      if (!best || cout < best.cout) {
        best = {
          materiau: m,
          nombre,
          cout,
        };
      }
    }

    return best;
  }

  // Calcule l'XP fournie par un matériau selon le rang et le bonus
  private calculerXpMateriau(m: MateriauModel, rang: number, bonus: number): number {
    const xpBase = m.experienceRang[rang - 1] || 0;
    return xpBase * bonus;
  }

  // Retourne le matériau qui atteint le total d'XP avec le moins d'exemplaires et son coût
  calculerMateriauOptimal(
    xpTotal: number,
    materiaux: MateriauModel[],
    rang: number,
  ): MateriauOptimise {
    // On commence par définir le bonus multiplicateur (×3 minimal)
    const bonus = 3;

    // Maintenant on cherche le matériau le plus rentable prix/XP
    let meilleur: MateriauOptimise | null = null;
    for (const m of materiaux) {
      const xpParExemplaire = this.calculerXpMateriau(m, rang, bonus);
      if (xpParExemplaire <= 0) continue;
      if (m.prixAchat === 0) continue;

      const nbExemplaires = Math.ceil(xpTotal / xpParExemplaire);
      const cout = nbExemplaires * m.prixAchat;

      if (!meilleur || cout < meilleur.cout || (cout === meilleur.cout && nbExemplaires < meilleur.nombre)
      ) {
        meilleur = { materiau: m, nombre: nbExemplaires, cout: cout };
      }
    }

    return meilleur!;
  }
}
