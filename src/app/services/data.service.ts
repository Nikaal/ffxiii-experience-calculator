import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArmeModel } from '../models/arme.model';
import { MateriauModel } from '../models/materiau.model';
import { AccessoireModel } from '../models/accessoire.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  // --- Armes ---
  loadArmes(): Observable<ArmeModel[]> {
    return this.http.get('assets/data/armes.xml', { responseType: 'text' }).pipe(
      map(xmlText => this.parseArmes(xmlText))
    );
  }

   private parseArmes(xmlText: string): ArmeModel[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const nodes = Array.from(xml.getElementsByTagName('Arme'));

    return nodes.map(node => ({
      identifiant: Number(this.getText(node, 'Identifiant')),
      nom: this.getText(node, 'Nom'),
      personnage: this.getText(node, 'Personnage'),
      rang: Number(this.getText(node, 'Rang')),
      niveauMax: Number(this.getText(node, 'NiveauMax')),
      groupeCompetencesDerivees: this.getText(node, 'GroupeCompetencesDerivees'),
      prixAchat: Number(this.getText(node, 'PrixAchat')),
      prixVente: Number(this.getText(node, 'PrixVente')),
      acquisition: this.getText(node, 'Acquisition'),
      catalyste: this.getText(node, 'Catalyste'),
      forceMin: Number(this.getText(node, 'ForceMin')),
      forceMax: Number(this.getText(node, 'ForceMax')),
      forceIncrement: Number(this.getText(node, 'ForceIncrement')),
      magieMin: Number(this.getText(node, 'MagieMin')),
      magieMax: Number(this.getText(node, 'MagieMax')),
      magieIncrement: Number(this.getText(node, 'MagieIncrement')),
      experienceBase: Number(this.getText(node, 'ExperienceBase')),
      experienceIncrement: Number(this.getText(node, 'ExperienceIncrement')),
    }));
  }

  // --- Accessoires ---
  loadAccessoires(): Observable<AccessoireModel[]> {
    return this.http.get('assets/data/accessoires.xml', { responseType: 'text' })
      .pipe(map(xml => this.parseAccessoires(xml)));
  }

   private parseAccessoires(xmlText: string): AccessoireModel[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const nodes = Array.from(xml.getElementsByTagName('Accessoire'));

    return nodes.map(node => ({
      identifiant: Number(this.getText(node, 'Identifiant')),
      nom: this.getText(node, 'Nom'),
      rang: Number(this.getText(node, 'Rang')),
      niveauMax: Number(this.getText(node, 'NiveauMax')),
      proprieteSpeciale: this.getText(node, 'ProprieteSpeciale'),
      groupeCompetencesDerivees: this.getText(node, 'GroupeCompetencesDerivees'),
      prixAchat: Number(this.getText(node, 'PrixAchat')),
      prixVente: Number(this.getText(node, 'PrixVente')),
      acquisition: this.getText(node, 'Acquisition'),
      catalyste: this.getText(node, 'Catalyste'),
      min: Number(this.getText(node, 'Min')),
      max: Number(this.getText(node, 'Max')),
      increment: Number(this.getText(node, 'Increment')),
      experienceBase: Number(this.getText(node, 'ExperienceBase')),
      experienceIncrement: Number(this.getText(node, 'ExperienceIncrement'))
    }));
  }

  // --- Materiaux ---
 loadMateriaux(): Observable<MateriauModel[]> {
    return this.http.get('assets/data/materiaux.xml', { responseType: 'text' })
      .pipe(map(xml => this.parseMateriaux(xml)));
  }

  private parseMateriaux(xmlText: string): MateriauModel[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const nodes = Array.from(xml.getElementsByTagName('Materiau'));

    return nodes.map(node => ({
      identifiant: Number(this.getText(node, 'Identifiant')),
      nom: this.getText(node, 'Nom'),
      multiplicateur: this.getText(node, 'Multiplicateur'),
      rang: Number(this.getText(node, 'Rang')),
      acquisition: this.getText(node, 'Acquisition'),
      prixAchat: Number(this.getText(node, 'PrixAchat')),
      prixVente: Number(this.getText(node, 'PrixVente')),
      experienceRang: Array.from({ length: 11 }, (_, i) => Number(this.getText(node, `ExperienceRang${i + 1}`)))
    }));
  }

  // --- helper pour lire un tag ---
  private getText(node: Element, tag: string): string {
    return node.getElementsByTagName(tag)[0]?.textContent ?? '';
  }

    // --- charger tout en une seule fois ---
  loadAll(): Observable<{ armes: ArmeModel[], materiaux: MateriauModel[], accessoires: AccessoireModel[] }> {
    return forkJoin({
      armes: this.loadArmes(),
      materiaux: this.loadMateriaux(),
      accessoires: this.loadAccessoires()
    });
  }

}
