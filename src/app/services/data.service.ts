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
  return this.http.get('assets/data/Armes.xml', { responseType: 'text' }).pipe(
    map(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

      // prendre le noeud parent <Armes>
      const parent = xmlDoc.getElementsByTagName('Armes')[0];
      if (!parent) return [];

      // récupérer tous les noeuds <Arme> à l'intérieur
      const nodes = Array.from(parent.getElementsByTagName('Arme'));

      return nodes.map(node => ({
        identifiant: Number(node.getElementsByTagName('Identifiant')[0]?.textContent),
        nom: node.getElementsByTagName('Nom')[0]?.textContent || '',
        personnage: node.getElementsByTagName('Personnage')[0]?.textContent || '',
        rang: Number(node.getElementsByTagName('Rang')[0]?.textContent),
        niveauMax: Number(node.getElementsByTagName('NiveauMax')[0]?.textContent),
        groupeCompetencesDerivees: node.getElementsByTagName('GroupeCompetencesDerivees')[0]?.textContent || '',
        prixAchat: Number(node.getElementsByTagName('PrixAchat')[0]?.textContent),
        prixVente: Number(node.getElementsByTagName('PrixVente')[0]?.textContent),
        acquisition: node.getElementsByTagName('Acquisition')[0]?.textContent || '',
        catalyste: node.getElementsByTagName('Catalyste')[0]?.textContent || '',
        forceMin: Number(node.getElementsByTagName('ForceMin')[0]?.textContent),
        forceMax: Number(node.getElementsByTagName('ForceMax')[0]?.textContent),
        forceIncrement: Number(node.getElementsByTagName('ForceIncrement')[0]?.textContent),
        magieMin: Number(node.getElementsByTagName('MagieMin')[0]?.textContent),
        magieMax: Number(node.getElementsByTagName('MagieMax')[0]?.textContent),
        magieIncrement: Number(node.getElementsByTagName('MagieIncrement')[0]?.textContent),
        experienceBase: Number(node.getElementsByTagName('ExperienceBase')[0]?.textContent),
        experienceIncrement: Number(node.getElementsByTagName('ExperienceIncrement')[0]?.textContent)
      }));
    })
  );
}

  // --- Accessoires ---
  loadAccessoires(): Observable<AccessoireModel[]> {
    return this.http.get('assets/data/Accessoires.xml', { responseType: 'text' }).pipe(
      map(xmlText => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        
        // prendre le noeud parent <Accessoires>
        const parent = xmlDoc.getElementsByTagName('Accessoires')[0];
        if (!parent) return [];
        
        // récupérer tous les noeuds <Accessoire> à l'intérieur
        const nodes = Array.from(parent.getElementsByTagName('Accessoire'));

        return nodes.map(node => ({
          identifiant: Number(node.getElementsByTagName('Identifiant')[0]?.textContent),
          nom: node.getElementsByTagName('Nom')[0]?.textContent || '',
          rang: Number(node.getElementsByTagName('Rang')[0]?.textContent),
          niveauMax: Number(node.getElementsByTagName('NiveauMax')[0]?.textContent),
          proprieteSpeciale: node.getElementsByTagName('ProprieteSpeciale')[0]?.textContent || '',
          groupeCompetencesDerivees: node.getElementsByTagName('GroupeCompetencesDerivees')[0]?.textContent || '',
          prixAchat: Number(node.getElementsByTagName('PrixAchat')[0]?.textContent),
          prixVente: Number(node.getElementsByTagName('PrixVente')[0]?.textContent),
          acquisition: node.getElementsByTagName('Acquisition')[0]?.textContent || '',
          catalyste: node.getElementsByTagName('Catalyste')[0]?.textContent || '',
          min: Number(node.getElementsByTagName('Min')[0]?.textContent),
          max: Number(node.getElementsByTagName('Max')[0]?.textContent),
          increment: Number(node.getElementsByTagName('Increment')[0]?.textContent),
          experienceBase: Number(node.getElementsByTagName('ExperienceBase')[0]?.textContent),
          experienceIncrement: Number(node.getElementsByTagName('ExperienceIncrement')[0]?.textContent),
        }));
      })
    );
  }  

  // --- Materiaux ---
  loadMateriaux(): Observable<MateriauModel[]> {
    return this.http.get('assets/data/Materiaux.xml', { responseType: 'text' }).pipe(
      map(xmlText => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        
        // prendre le noeud parent <Materiaux>
        const parent = xmlDoc.getElementsByTagName('Materiaux')[0];
        if (!parent) return [];
        
        // récupérer tous les noeuds <Materiau> à l'intérieur
        const nodes = Array.from(parent.getElementsByTagName('Materiau'));

        return nodes.map(node => ({
          identifiant: Number(node.getElementsByTagName('Identifiant')[0]?.textContent),
          nom: node.getElementsByTagName('Nom')[0]?.textContent || '',
          multiplicateur: Number(node.getElementsByTagName('Multiplicateur')[0]?.textContent),
          rang: Number(node.getElementsByTagName('Rang')[0]?.textContent),
          acquisition: node.getElementsByTagName('Acquisition')[0]?.textContent || '',
          prixAchat: Number(node.getElementsByTagName('PrixAchat')[0]?.textContent),
          prixVente: Number(node.getElementsByTagName('PrixVente')[0]?.textContent),
          experienceRang: Array.from({ length: 11 }, (_, i) => Number(node.getElementsByTagName(`ExperienceRang${i + 1}`)[0]?.textContent))
        }));      
      })
    );
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
