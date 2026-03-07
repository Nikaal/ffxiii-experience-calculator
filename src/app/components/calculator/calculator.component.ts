import { Component, OnInit } from '@angular/core';
import { CalculatorService } from '../../services/calculator.service';
import { ArmeModel } from '../../models/arme.model';
import { MateriauModel } from '../../models/materiau.model';

@Component({
  selector: 'app-calculator',
  imports: [],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent implements OnInit {

  resultat: number = 0;

  constructor(private calculator: CalculatorService) { }

  ngOnInit(): void {
    // Exemple simple pour tester
    const arme: ArmeModel = {
      identifiant: 1,
      nom: "Pistolame Sanctum",
      personnage: "Lightning",
      rang: 3,
      niveauMax: 26,
      groupeCompetencesDerivees: "Défense physique",
      prixAchat: 2000,
      prixVente: 1000,
      acquisition: "Boutique",
      catalyste: "Pérovskite",
      forceMin: 15,
      forceMax: 115,
      forceIncrement: 4,
      magieMin: 15,
      magieMax: 115,
      magieIncrement: 4,
      experienceBase: 300,
      experienceIncrement: 57
    };

    const materiaux: MateriauModel[] = [
      { identifiant:1, nom:"Griffe encrassée", multiplicateur:"+4", rang:1, acquisition:"Mob", prixAchat:0, prixVente:15, experienceRang:[8,7,6,5,4,4,3,2,1,1,1] }
    ];

    this.resultat = this.calculator.calculerXpArme(arme, 1, 5);
  }

}
