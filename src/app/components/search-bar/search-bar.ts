import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  NgModule,
  output,
  signal,
} from '@angular/core';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';
import { IAstronomicalObject } from '../../models/astronomical-object.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private readonly astronomicalObject = inject(AstronomicalObjectService);
  public readonly objectSelected = output<IAstronomicalObject>();

  readonly searchControl = new FormControl('', {
    nonNullable: true,
  });

  readonly results = signal<IAstronomicalObject[]>([]);
  readonly selectedIndex = signal(-1);
  readonly isSearching = signal(false);

  readonly hasQuery = computed(() => this.searchControl.value.trim().length > 0);

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.results.set([]);
      this.selectedIndex.set(-1);
    }
  }

  constructor(private readonly elementRef: ElementRef) {
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => {
        this.isSearching.set(query.trim().length > 0);
        this.results.set(this.astronomicalObject.search(query));
        this.selectedIndex.set(-1);
      });
  }

  public select(object: IAstronomicalObject): void {
    this.searchControl.setValue(object.target, {
      emitEvent: false,
    });

    this.results.set([]);
    this.isSearching.set(false);

    this.objectSelected.emit(object);
  }

  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveDown();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.moveUp();
        break;

      case 'Enter':
        event.preventDefault();
        this.confirmSelection();
        break;

      case 'Escape':
        this.closeSuggestions();
        break;
    }
  }

  private moveDown(): void {
    if (!this.results().length) {
      return;
    }

    this.selectedIndex.update((index) => Math.min(index + 1, this.results().length - 1));
  }

  private moveUp(): void {
    this.selectedIndex.update((index) => Math.max(index - 1, 0));
  }

  private confirmSelection(): void {
    const object = this.results()[this.selectedIndex()];

    if (!object) {
      return;
    }

    this.select(object);
  }

  private closeSuggestions(): void {
    this.results.set([]);
    this.selectedIndex.set(-1);
  }
}
