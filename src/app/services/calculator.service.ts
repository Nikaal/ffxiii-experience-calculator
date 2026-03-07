import { Injectable } from '@angular/core';
import { ArmeModel } from '../models/arme.model';
import { AccessoireModel } from '../models/accessoire.model';
import { MateriauModel } from '../models/materiau.model';

interface MateriauOptimise {
  materiau: MateriauModel;
  nbExemplaires: number;
  coutTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {

  constructor() {}

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible
  calculerXpTotal(niveauActuel: number, niveauCible: number, base: number, increment: number): number {
    let xpTotal = 0;
    for (let lvl = niveauActuel; lvl < niveauCible; lvl++) {
      xpTotal += base + increment * (lvl - 1);
    }
    return xpTotal;
  }

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible d'une arme
  calculerXpArme(arme: ArmeModel, niveauActuel: number, niveauCible: number): number {
    return this.calculerXpTotal(niveauActuel, niveauCible, arme.experienceBase, arme.experienceIncrement);
  }

  // Calcule le total d'XP nécessaire pour passer du niveau actuel au niveau cible d'un accessoire
  calculerXpAccessoire(accessoire: AccessoireModel, niveauActuel: number, niveauCible: number): number {
    return this.calculerXpTotal(niveauActuel, niveauCible, accessoire.experienceBase, accessoire.experienceIncrement);
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
  getMateriauxPourBonusMax(materiaux: MateriauModel[]): {materiau: MateriauModel, count: number}[] {
    // tri décroissant par valeur absolue du multiplicateur
    const sorted = [...materiaux].sort((a,b) => 
      Math.abs(Number(b.multiplicateur)) - Math.abs(Number(a.multiplicateur))
  );

  const result: {materiau: MateriauModel, count: number}[] = [];
  let total = 0;

  for (const m of sorted) {
    const mult = Number(m.multiplicateur) || 0;
    if(mult <= 0) continue; // on ignore les multiplicateurs négatifs pour atteindre bonus ×3
    let needed = 0;
    while(total <= 500) {
      total += mult;
      needed++;
    }
    if(needed > 0) result.push({materiau: m, count: needed});
    if(total > 500) break;
  }
  
  return result;
  }

  // Calcule l'XP fournie par un matériau selon le rang et le bonus
  private calculerXpMateriau(m: MateriauModel, rang: number, bonus: number): number {
    const xpBase = m.experienceRang[rang-1] || 0;
    return xpBase * bonus;
  }

  // Retourne le matériau qui atteint le total d'XP avec le moins d'exemplaires et son coût
  calculateMateriauOptimal(
    xpTotal: number,
    materiaux: MateriauModel[],
    rang: number
  ): MateriauOptimise {

    // On commence par obtenir le bonus ×3 minimal
    const materiauxBonus = this.getMateriauxPourBonusMax(materiaux);
    const totalBonusMultiplicateur = materiauxBonus.reduce(
      (sum, m) => sum + Number(m.materiau.multiplicateur) * m.count, 0
    );
    const bonus = this.getBonusMultiplicateur(totalBonusMultiplicateur);

    // Maintenant on cherche le matériau le plus rentable prix/XP
    let meilleur: MateriauOptimise | null = null;
    for(const m of materiaux){
      const xpParExemplaire = this.calculerXpMateriau(m, rang, bonus);
      if(xpParExemplaire <= 0) continue;

      const nbExemplaires = Math.ceil(xpTotal / xpParExemplaire);
      const cout = nbExemplaires * m.prixAchat;

      if(!meilleur || nbExemplaires < meilleur.nbExemplaires || 
         (nbExemplaires === meilleur.nbExemplaires && cout < meilleur.coutTotal)){
        meilleur = { materiau: m, nbExemplaires, coutTotal: cout };
      }
    }

    return meilleur!;
  }

}
