import { Component, AfterViewInit } from '@angular/core';
declare let A: any;

@Component({
  selector: 'app-sky-map',
  imports: [],
  templateUrl: './sky-map.html',
  styleUrl: './sky-map.css',
})
export class SkyMap implements AfterViewInit{
  public aladin: any;

  ngAfterViewInit(): void {

    this.aladin = A.aladin('#aladin-lite-div', {

      survey: 'P/2MASS/color',

      target: 'Orion',

      fov: 20,

      showFullscreenControl: false,

      showLayersControl: false,

      showGotoControl: false,
    });

    this.aladin.on('click', (position: any) => {

      console.log(
        'RA:',
        position.ra,
        'DEC:',
        position.dec
      );

    });

  }
}
