import { Component, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon';
import { AppMode } from '../../models/app-mode.model';
import { ɵEmptyOutletComponent } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [SvgIconComponent, ɵEmptyOutletComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public readonly changeMode = output<AppMode>();

  public toQuiz() {
    this.changeMode.emit(AppMode.Quiz);
  }

  public toGuidedExploration() {
    this.changeMode.emit(AppMode.GuidedExploration);
  }

  public toFreeExploration() {
    this.changeMode.emit(AppMode.FreeExploration);
  }

  public toSpaceGuessR() {
    this.changeMode.emit(AppMode.SpaceGuessR);
  }
}
