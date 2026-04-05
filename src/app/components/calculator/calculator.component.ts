import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../../services/calculator.service';
import { ArmeModel } from '../../models/arme.model';
import { MateriauModel } from '../../models/materiau.model';
import { AccessoireModel } from '../../models/accessoire.model';
import { DataService } from '../../services/data.service';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay } from 'rxjs';

interface CalculResultat {
  xpNecessaire: number;
  multiplicateurMateriau?: string;
  multiplicateurNombre?: number;
  multiplicateurCout?: number;
  multiplicateurXp?: number;
  materiauOptimal?: string;
  materiauNombre?: number;
  materiauCout?: number;
  coutTotal?: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent {
  typeSelection: 'arme' | 'accessoire' = 'arme';

  data$: Observable<{
    armes: ArmeModel[];
    materiaux: MateriauModel[];
    accessoires: AccessoireModel[];
  }>;

  personnages: string[] = ['Lightning', 'Sazh', 'Snow', 'Hope', 'Vanille', 'Fang'];
  armesParPersonnage: { [personnage: string]: ArmeModel[] } = {};
  armes: ArmeModel[] = [];
  armesFiltrees: ArmeModel[] = [];
  accessoires: AccessoireModel[] = [];
  materiaux: MateriauModel[] = [];

  personnageSelectionne?: string;
  armeSelectionnee$ = new BehaviorSubject<ArmeModel | null>(null);
  armeSelectionnee: ArmeModel | null = null;
  accessoireSelectionne$ = new BehaviorSubject<AccessoireModel | null>(null);
  accessoireSelectionne: AccessoireModel | null = null;

  niveauActuel$ = new BehaviorSubject<number | null>(null);
  niveauActuel = 1;
  niveauCible$ = new BehaviorSubject<number | null>(null);
  niveauCible = 1;
  xpNecessaire = 0;
  forceNiveauActuel = 1;
  magieNiveauActuel = 1;
  experienceNiveauActuel = 1;
  accessoireProprieteNiveauActuel = "";

  resultatCalcul$: Observable<CalculResultat | null>;

  constructor(private calculatorService: CalculatorService, private dataService: DataService) {
    // Charger les données XML
    this.data$ = this.dataService.loadAll().pipe(shareReplay(1));

    this.data$.subscribe((data) => {
      this.armes = data.armes;
      this.materiaux = data.materiaux;
      this.accessoires = data.accessoires;
    });

    // Créer la Map armesParPersonnage
    this.data$.subscribe((data) => {
      this.personnages.forEach((p) => {
        this.armesParPersonnage[p] = data.armes.filter((a) => a.personnage === p);
      });
    });

    // Créer le résultat
    this.resultatCalcul$ = combineLatest({
      data: this.data$,
      arme: this.armeSelectionnee$,
      accessoire: this.accessoireSelectionne$,
      niveauActuel: this.niveauActuel$,
      niveauCible: this.niveauCible$
    }).pipe(
      map(({ data, arme, accessoire, niveauActuel, niveauCible }) => {
        const equipement = arme ?? accessoire;
        if (!equipement) return null;

        if (!niveauActuel || !niveauCible || niveauActuel >= niveauCible) return null;        

        const xp = this.calculatorService.calculerXpTotal(
          niveauActuel,
          niveauCible,
          equipement.niveauMax,
          equipement.experienceBase,
          equipement.experienceIncrement
        );

        const bonus = this.calculatorService.getMateriauPourBonusMax(data.materiaux, equipement.rang);

        const materiau = this.calculatorService.calculerMateriauOptimal(
          xp,
          this.materiaux,
          equipement.rang,
        );

        return {
          xpNecessaire: xp,

          multiplicateurMateriau: bonus.materiau.nom,
          multiplicateurNombre: bonus.nombre,
          multiplicateurCout: bonus.cout,
          multiplicateurXp: bonus.xp,

          materiauOptimal: materiau.materiau.nom,
          materiauNombre: materiau.nombre,
          materiauCout: materiau.cout,

          coutTotal: bonus.cout + materiau.cout,
        };
      }),
    );
  }

  onTypeChange(type: 'arme' | 'accessoire') {
    this.typeSelection = type;

    // reset sélections
    this.personnageSelectionne = undefined;
    this.armeSelectionnee = null;
    this.accessoireSelectionne = null;

    this.armeSelectionnee$.next(null);
    this.accessoireSelectionne$.next(null);
    
    this.niveauActuel$.next(1);
    this.niveauActuel = 1;
    this.niveauCible$.next(1);
    this.niveauCible = 1;
  }

  onPersonnageChange() {
    this.armeSelectionnee$.next(null);
    this.niveauActuel$.next(1);
    this.niveauActuel = 1;
    this.niveauCible$.next(1);
    this.niveauCible = 1;
  }

  onArmeChange(arme: ArmeModel | null) {
    this.armeSelectionnee$.next(arme);
    this.niveauActuel$.next(1);
    this.niveauActuel = 1;
    this.niveauCible$.next(1);
    this.niveauCible = 1;
    this.calculerForceMagieExperienceNiveauActuel();
  }

  onNiveauActuelArmeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const max = this.armeSelectionnee$.value?.niveauMax ?? 1;

    if (value > max) value = max;
    if (value < 1) value = 1;

    this.niveauActuel$.next(value);
    this.niveauActuel = value;
    input.value = value.toString();
  }

  onNiveauCibleArmeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const max = this.armeSelectionnee$.value?.niveauMax ?? 1;

    if (value > max) value = max;
    if (value < 1) value = 1;

    this.niveauCible$.next(value);
    this.niveauCible = value;
    input.value = value.toString();
  }

  onNiveauActuelArmeChange() {
    this.niveauActuel$.next(this.niveauActuel);
    this.calculerForceMagieExperienceNiveauActuel();
  }

  calculerForceMagieExperienceNiveauActuel() {
    if (this.armeSelectionnee$.value === null) return;
    if (this.niveauActuel === 0 || this.niveauActuel > this.armeSelectionnee$.value.niveauMax) return;

    this.forceNiveauActuel = this.calculatorService.calculerForceArme(
      this.armeSelectionnee$.value,
      this.niveauActuel,
    );
    this.magieNiveauActuel = this.calculatorService.calculerMagieArme(
      this.armeSelectionnee$.value,
      this.niveauActuel,
    );
    this.experienceNiveauActuel = this.calculatorService.calculerXpArme(
      this.armeSelectionnee$.value,
      this.niveauActuel
    );
  }

  onAccessoireChange(accessoire: AccessoireModel | null) {
    this.accessoireSelectionne$.next(accessoire);
    this.niveauActuel$.next(1);
    this.niveauActuel = 1;
    this.niveauCible$.next(1);
    this.niveauCible = 1;
    this.calculerProprietesAccessoireNiveauActuel();
  }

  onNiveauActuelAccessoireInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const max = this.accessoireSelectionne$.value?.niveauMax ?? 1;

    if (value > max) value = max;
    if (value < 1) value = 1;

    this.niveauActuel$.next(value);
    this.niveauActuel = value;
    input.value = value.toString();
  }

  onNiveauCibleAccessoireInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    const max = this.accessoireSelectionne$.value?.niveauMax ?? 1;

    if (value > max) value = max;
    if (value < 1) value = 1;

    this.niveauCible$.next(value);
    this.niveauCible = value;
    input.value = value.toString();
  }

  onNiveauActuelAccessoireChange() {
    this.niveauActuel$.next(this.niveauActuel);
    this.calculerProprietesAccessoireNiveauActuel();
  }

  calculerProprietesAccessoireNiveauActuel() {
    if (this.accessoireSelectionne$.value === null) return;
    if (this.niveauActuel === 0 || this.niveauActuel > this.accessoireSelectionne$.value.niveauMax) return;
    this.accessoireProprieteNiveauActuel = this.calculatorService.calculerProprieteAccessoire(this.accessoireSelectionne$.value, this.niveauActuel);
    this.experienceNiveauActuel = this.calculatorService.calculerXpAccessoire(this.accessoireSelectionne$.value, this.niveauActuel);
  }
}
