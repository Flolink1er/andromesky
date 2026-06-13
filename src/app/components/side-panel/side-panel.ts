import { Component, input, output } from '@angular/core';
import { AstronomicalObject } from '../../data/astronomical-objects';

@Component({
  selector: 'app-side-panel',
  imports: [],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  public readonly currentObject = input.required<AstronomicalObject>();
  public readonly currentIndex = input.required<number>();

  public readonly action = output<string>();

  public toPreviousObject() {
    this.action.emit('previous');
  }

  public toNextObject() {
    this.action.emit('next');
  }
}
