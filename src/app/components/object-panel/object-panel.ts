import { Component, computed, effect, inject, input, output, signal } from '@angular/core';

import { IAstronomicalObject } from '../../models/astronomical-object.model';
import { IAstronomicalImage } from '../../models/nasa-image.model';
import { IWikipediaSummary } from '../../models/wiki.model';

import { ConstellationService } from '../../services/constellation.service';
import { NasaImageService } from '../../services/nasa-image.service';
import { WikipediaService } from '../../services/wikipedia.service';
import { AstronomicalObjectService } from '../../services/astronomical-object.service';

@Component({
  selector: 'app-object-panel',
  imports: [],
  templateUrl: './object-panel.html',
  styleUrl: './object-panel.css',
})
export class ObjectPanel {
  public readonly currentObject = input.required<IAstronomicalObject>();

  public readonly currentIndex = input.required<number>();

  public readonly previous = output<void>();

  public readonly next = output<void>();

  protected readonly astronomicalObjectService = inject(AstronomicalObjectService);

  private readonly constellationService = inject(ConstellationService);

  private readonly nasaImageService = inject(NasaImageService);

  private readonly wikipediaService = inject(WikipediaService);

  public readonly image = signal<IAstronomicalImage | null>(null);

  public readonly isLoadingImage = signal(false);

  public readonly wikiSummary = signal<IWikipediaSummary | null>(null);

  public readonly isLoadingWiki = signal(false);

  public readonly constellation = computed(() => {
    const object = this.currentObject();

    if (!object.constellationId) {
      return null;
    }

    return this.constellationService.findById(object.constellationId);
  });

  constructor() {
    effect((onCleanup) => {
      const object = this.currentObject();

      this.image.set(null);
      this.wikiSummary.set(null);

      this.isLoadingImage.set(true);
      this.isLoadingWiki.set(true);

      const nasaSubscription = this.nasaImageService.searchImage(object).subscribe({
        next: (image) => this.image.set(image),

        error: () => this.image.set(null),

        complete: () => this.isLoadingImage.set(false),
      });

      const wikiSubscription = this.wikipediaService.searchSummary(object).subscribe({
        next: (summary) => this.wikiSummary.set(summary),

        error: () => this.wikiSummary.set(null),

        complete: () => this.isLoadingWiki.set(false),
      });

      onCleanup(() => {
        nasaSubscription.unsubscribe();
        wikiSubscription.unsubscribe();
      });
    });
  }

  public toPrevious(): void {
    this.previous.emit();
  }

  public toNext(): void {
    this.next.emit();
  }
}
