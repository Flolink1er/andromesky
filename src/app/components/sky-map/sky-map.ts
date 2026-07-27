import { Component, AfterViewInit, inject, output } from '@angular/core';
import { SkyMapService } from '../../services/sky-map.service';

@Component({
  selector: 'app-sky-map',
  imports: [],
  templateUrl: './sky-map.html',
  styleUrl: './sky-map.css',
})
export class SkyMap implements AfterViewInit {
  public aladin: any;
  private readonly DEFAULT_TARGET = 'Orion';

  private readonly DEFAULT_FOV = 20;

  private skyMapService = inject(SkyMapService);
  public objectClicked = output<{ ra: number; dec: number }>();

  ngAfterViewInit(): void {
    //body de la requête avec paramêtre d'affichage
    this.skyMapService.initializeMap('#aladin-lite-div');
    this.skyMapService.registerClickHandler((ra, dec) => {
      this.objectClicked.emit({ ra, dec });
    });
  }
}
