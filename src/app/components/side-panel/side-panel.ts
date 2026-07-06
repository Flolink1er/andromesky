import { Component, inject, input, output } from '@angular/core';
import { AstronomicalObject } from '../../models/astronomical-object.model';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';
import { QuizService } from '../../services/quiz.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  imports: [NgClass],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel {
  public readonly currentObject = input.required<AstronomicalObject>();
  public readonly currentIndex = input.required<number>();
  public readonly astronomicalObjectService = inject(AstronomicalObjectService);
  public readonly quizService = inject(QuizService);

  public readonly action = output<string>();
  public readonly answer = output<AstronomicalObject>();

  public toPreviousObject() {
    this.action.emit('previous');
  }

  public toNextObject() {
    this.action.emit('next');
  }

  public answerQuestion(choice: AstronomicalObject) {
    this.answer.emit(choice);
  }
}
