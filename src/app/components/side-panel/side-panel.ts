import { Component, input } from '@angular/core';
import { AstronomicalObject } from '../../data/astronomical-objects';

@Component({
  selector: 'app-side-panel',
  imports: [],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  public readonly currentObject = input.required<AstronomicalObject>();
}
