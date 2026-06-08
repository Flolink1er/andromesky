import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { SidePanel } from "./components/side-panel/side-panel";
import { SkyMap } from "./components/sky-map/sky-map";
import { ASTRONOMICAL_OBJECTS } from './data/astronomical-objects';

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AndromeSky');

  public currentIndex = 0;

  objects = ASTRONOMICAL_OBJECTS;

  public get currentObject() {
    return this.objects[this.currentIndex];
  }

  public nextObject(){
    this.currentIndex = (this.currentIndex + 1) % this.objects.length;
  }

  public previousObject(){
    this.currentIndex = (this.currentIndex - 1) % this.objects.length;
  }
}
