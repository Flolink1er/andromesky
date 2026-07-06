import { Component, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon';

@Component({
  selector: 'app-header',
  imports: [SvgIconComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public readonly action = output<string>();

  public toQuiz() {
    this.action.emit('toQuiz');
  }
}
