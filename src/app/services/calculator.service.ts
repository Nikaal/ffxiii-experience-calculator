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
  calculerXpTotal(niveauActuel: number, niveauCible: number, niveauMax: number, base: number, increment: number): number {
    let xpTotal = 0;

    if (niveauCible === 1) return base;

    if (niveauActuel === niveauMax) return 0;

    if (niveauActuel === niveauCible) return base + increment * (niveauActuel - 1);

    for (let lvl = niveauActuel; lvl < niveauCible; lvl++) {
      xpTotal += base + increment * (lvl - 1);
    }

    return xpTotal;
  }

  // Calcule l'XP de l'arme à un niveau spécifique
  calculerXpArme(arme: ArmeModel, niveau: number): number {
    if (niveau === 1) return arme.experienceBase;
    else if (niveau === arme.niveauMax) return 0;
    else return arme.experienceBase + arme.experienceIncrement * (niveau - 1);
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

  // Calcule l'XP de l'accessoire à un niveau spécifique
  calculerXpAccessoire(accessoire: AccessoireModel, niveau: number): number {
    if (niveau === 1) return accessoire.experienceBase;
    else if (niveau === accessoire.niveauMax) return 0;
    else return accessoire.experienceBase + accessoire.experienceIncrement * (niveau - 1);
  }

  calculerProprieteAccessoire(accessoire: AccessoireModel, niveau: number): string {
    if (accessoire.min === 0 || niveau === 1) return accessoire.proprieteSpeciale;
    const p = this.parseProprieteSpeciale(accessoire.proprieteSpeciale);
    let nouveauNombre = accessoire.min + accessoire.increment * (niveau - 1);
    return p!.texte + " +" + nouveauNombre + (p!.pourcentage ? "%" : "");
  }

  parseProprieteSpeciale(valeur: string) {
    const match = valeur.match(/^(.+?)\s*([+-]?\d+)(%)?$/);
    if (!match) return null;
    return {
      texte: match[1].trim(),
      nombre: Number(match[2]),      
      pourcentage: match[3] === '%'
    };
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
  getMateriauPourBonusMax(materiaux: MateriauModel[], rang: number): { materiau: MateriauModel; nombre: number; cout: number; xp: number } {
    let best!: { materiau: MateriauModel; nombre: number; cout: number, xp: number };

    for (const m of materiaux) {
      const mult = Number(m.multiplicateur) || 0;

      if (mult <= 0) continue; // on ignore les multiplicateurs négatifs
      if (m.prixAchat === 0) continue; // on ignore les matériaux qu'on ne peut pas acheter

      const nombre = Math.floor(501 / mult) + 1; // atteindre strictement >500
      const cout = nombre * m.prixAchat;
      const xp = nombre * m.experienceRang[rang - 1];

      if (!best || cout < best.cout) {
        best = {
          materiau: m,
          nombre,
          cout,
          xp
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
    avecBonus: boolean
  ): MateriauOptimise {
    // On commence par définir le bonus multiplicateur (×3 minimal)
    let bonus = avecBonus ? 3 : 1;

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
