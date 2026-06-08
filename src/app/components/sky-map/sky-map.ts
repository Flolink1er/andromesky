import { Component, AfterViewInit, inject } from '@angular/core';
import { SkyMapService } from '../../services/sky-map.service';


@Component({
  selector: 'app-sky-map',
  imports: [],
  templateUrl: './sky-map.html',
  styleUrl: './sky-map.css',
})
export class SkyMap implements AfterViewInit{
  public aladin: any;
  private readonly DEFAULT_TARGET = 'Orion';

  private readonly DEFAULT_FOV = 20;

  private skyMapService = inject(SkyMapService);



  ngAfterViewInit(): void {
    //body de la requête avec paramêtre d'affichage
    this.skyMapService.initializeMap('#aladin-lite-div')

    this.skyMapService.registerMapEvents();

  }
}
