import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../../services/calculator.service';
import { ArmeModel } from '../../models/arme.model';
import { MateriauModel } from '../../models/materiau.model';
import { AccessoireModel } from '../../models/accessoire.model';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent {

  typeSelection: 'arme' | 'accessoire' = 'arme';

  data$: Observable<{armes: ArmeModel[], materiaux: MateriauModel[], accessoires: AccessoireModel[]}>;
  personnages: string[] = ["Lightning","Sazh","Snow", "Hope", "Vanille", "Fang"];
  armesParPersonnage: { [personnage: string]: ArmeModel[] } = {};
  armes: ArmeModel[] = [];
  armesFiltrees: ArmeModel[] = [];
  accessoires: AccessoireModel[] = [];
  materiaux: MateriauModel[] = [];

  personnageSelectionne?: string;
  armeSelectionnee?: any;
  accessoireSelectionne?: any;

  niveauActuel = 1;
  xpNecessaire = 0;

  private _niveauCibleArme: number = 1;
  private _niveauCibleAcessoire: number = 1;

  resultat: {
    nom: string,
    nombre: number,
    cout: number
  } | null = null;

  get niveauCibleArme(): number {
    return this._niveauCibleArme;
  }

  set niveauCibleArme(value: number) {
    if (this.armeSelectionnee) {
      // clamp entre 1 et niveauMax
      this._niveauCibleArme = Math.max(1, Math.min(value, this.armeSelectionnee.niveauMax));
    } else {
      this._niveauCibleArme = Math.max(1, value);
    }
  }

  get niveauCibleAccessoire(): number {
    return this._niveauCibleAcessoire;
  }

  set niveauCibleAccessoire(value: number) {
    if (this.accessoireSelectionne) {
      // clamp entre 1 et niveauMax
      this._niveauCibleAcessoire = Math.max(1, Math.min(value, this.armeSelectionnee.niveauMax));
    } else {
      this._niveauCibleAcessoire = Math.max(1, value);
    }
  }

  constructor(private calculator: CalculatorService, private dataService: DataService) {
    // Charger les données XML
    this.data$ = this.dataService.loadAll().pipe(shareReplay(1));

    // Créer la Map armesParPersonnage
    this.data$.subscribe(data => {
      this.personnages.forEach(p => {
        this.armesParPersonnage[p] = data.armes.filter(a => a.personnage === p);
      });
    });
  }

  

onPersonnageChange() {
  this.armeSelectionnee = undefined;
}

  calculerArme() {

    if(!this.armeSelectionnee) return;

    this.xpNecessaire = this.calculator.calculerXpTotal(
      this.niveauActuel,
      this.niveauCibleArme,
      this.armeSelectionnee.experienceBase,
      this.armeSelectionnee.experienceIncrement
    );

    const optimal = this.calculator.calculerMateriauOptimal(
      this.xpNecessaire,
      this.materiaux,
      this.armeSelectionnee.rang
    );

    this.resultat = {
      nom: optimal.materiau.nom,
      nombre: optimal.nbExemplaires,
      cout: optimal.coutTotal
    };

  }

  calculerAccessoire() {

    if(!this.accessoireSelectionne) return;

    const xp = this.calculator.calculerXpTotal(
      this.niveauActuel,
      this.niveauCibleArme,
      this.accessoireSelectionne.experienceBase,
      this.accessoireSelectionne.experienceIncrement
    );

    const optimal = this.calculator.calculerMateriauOptimal(
      this.xpNecessaire,
      this.materiaux,
      this.accessoireSelectionne.rang
    );

    this.resultat = {
      nom: optimal.materiau.nom,
      nombre: optimal.nbExemplaires,
      cout: optimal.coutTotal
    };
  }
  
}
