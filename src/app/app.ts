import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { SidePanel } from "./components/side-panel/side-panel";
import { SkyMap } from "./components/sky-map/sky-map";

@Component({
  selector: 'app-root',
  imports: [Header, SidePanel, SkyMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AndromeSky');
}
