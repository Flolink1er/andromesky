import { Injectable } from '@angular/core';
import { AstronomicalObject } from '../data/astronomical-objects';
declare let A: any;

@Injectable({
  providedIn: 'root',
})
export class SkyMapService {
  private aladin: any;
  private markerCatalog: any;

  public initializeMap(container: string): void {
    this.aladin = A.aladin(container, {
      survey: 'P/2MASS/color',

      target: 'Orion',

      fov: 20,

      showFullscreenControl: false,

      showLayersControl: false,

      showGotoControl: false,

      showZoomControl: false,

      showReticle: false,

      showFrame: false,

      showCooLocation: false,

      showFov: false,

      showProjectionControl: false,
    });

    this.markerCatalog = A.catalog({
      name: 'Current Object',
      sourceSize: 20,
    });

    this.aladin.addCatalog(this.markerCatalog);
  }

  public goToObject(object: AstronomicalObject) {
    if (!this.aladin) {
      return;
    }
    this.markerCatalog.clear();

    this.aladin.gotoObject(object.target);

    this.highlightObject(object);
  }

  public registerMapEvents(): void {
    this.aladin.on('click', (position: any) => {
      console.log('RA:', position.ra, 'DEC:', position.dec);
    });
  }

  private highlightObject(object: AstronomicalObject): void {
    this.markerCatalog.clear();
    const marker = A.marker(object.ra!, object.dec!);

    this.markerCatalog.addSources([marker]);
  }
}
