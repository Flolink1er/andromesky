import { Injectable } from '@angular/core';
declare let A: any;

@Injectable({
  providedIn: 'root',
})
export class SkyMapService {
  private aladin: any;

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
  }

  public goToObject(target: string) {
    if (!this.aladin) {
      return;
    }
    this.aladin.gotoObject(target);
  }

  public registerMapEvents(): void {
    this.aladin.on('click', (position: any) => {
      console.log('RA:', position.ra, 'DEC:', position.dec);
    });
  }
}
