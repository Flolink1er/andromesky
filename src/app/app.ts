import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { SidePanel } from './components/side-panel/side-panel';
import { SkyMap } from './components/sky-map/sky-map';
import { ASTRONOMICAL_OBJECTS, AstronomicalObject } from './data/astronomical-objects';
import { SkyMapService } from './services/sky-map.service';
import { AstronomicalObjectService } from './services/astronomical-object.service';

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('AndromeSky');
  public readonly skyMapService = inject(SkyMapService);
  public readonly astronomicalObjectService = inject(AstronomicalObjectService);

  public _currentIndex = signal(0);

  objects = ASTRONOMICAL_OBJECTS;

  public ngAfterViewInit(): void {
    this.skyMapService.registerClickHandler((ra, dec) => {
      const nearest = this.astronomicalObjectService.findNearestObject(ra, dec, this.objects);

      if (!nearest) {
        return;
      }

      this.currentIndex = this.objects.findIndex((object) => object.target === nearest.target);

      this.skyMapService.goToObject(this.currentObject);
    });
  }

  public get currentObject(): AstronomicalObject {
    return this.objects[this.currentIndex];
  }

  public get currentIndex(): number {
    return this._currentIndex();
  }

  public set currentIndex(value: number) {
    this._currentIndex.set(value);
  }

  public nextObject() {
    this.currentIndex = (this.currentIndex + 1) % this.objects.length;
  }

  public previousObject() {
    this.currentIndex = (this.currentIndex - 1 + this.objects.length) % this.objects.length;
  }

  public handleAction(action: string) {
    if (action == 'next') {
      this.nextObject();
    } else if (action == 'previous') {
      this.previousObject();
    }
    this.skyMapService.goToObject(this.currentObject);
  }

  public selectObject(ra: number, dec: number): void {
    const nearest = this.astronomicalObjectService.findNearestObject(ra, dec, this.objects);

    if (!nearest) {
      return;
    }

    this.currentIndex = this.objects.indexOf(nearest);

    this.skyMapService.goToObject(nearest);
  }
}
