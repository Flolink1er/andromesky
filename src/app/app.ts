import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { SidePanel } from './components/side-panel/side-panel';
import { SkyMap } from './components/sky-map/sky-map';
import { ASTRONOMICAL_OBJECTS, AstronomicalObject } from './data/astronomical-objects';
import { SkyMapService } from './services/sky-map.service';

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AndromeSky');
  public readonly skyMapService = inject(SkyMapService);

  public currentIndex = 0;

  objects = ASTRONOMICAL_OBJECTS;

  public get currentObject(): AstronomicalObject {
    return this.objects[this.currentIndex];
  }

  public nextObject() {
    this.currentIndex = (this.currentIndex + 1) % this.objects.length;
  }

  public previousObject() {
    this.currentIndex = (this.currentIndex - 1) % this.objects.length;
  }

  public handleAction(action: string) {
    if (action == 'next') {
      this.nextObject();
    } else if (action == 'previous') {
      this.previousObject();
    }
    this.skyMapService.goToObject(this.currentObject.target);
  }
}
