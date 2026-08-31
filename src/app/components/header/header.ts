import { Component, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon';
import { AppMode } from '../../models/app-mode.model';

@Component({
  selector: 'app-header',
  imports: [SvgIconComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public readonly changeMode = output<AppMode>();

  public toQuiz() {
    this.changeMode.emit(AppMode.Quiz);
  }

  public toExploration() {
    this.changeMode.emit(AppMode.Exploration);
  }

  public toSpaceGuessR() {
    this.changeMode.emit(AppMode.SpaceGuessR);
  }
}
