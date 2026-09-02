import { AfterViewInit, Component, HostListener, inject, output, signal } from '@angular/core';
import { SkyMapService } from '../../services/sky-map.service';

@Component({
  selector: 'app-sky-map',
  imports: [],
  templateUrl: './sky-map.html',
  styleUrl: './sky-map.css',
})
export class SkyMap implements AfterViewInit {
  private static readonly DRAG_THRESHOLD_PX = 8;

  public aladin: any;
  private readonly DEFAULT_TARGET = 'Orion';

  private readonly DEFAULT_FOV = 20;

  private skyMapService = inject(SkyMapService);
  public objectClicked = output<{ ra: number; dec: number }>();
  public readonly isDragging = signal(false);

  private pointerStart?: { pointerId: number; x: number; y: number };

  ngAfterViewInit(): void {
    //body de la requête avec paramêtre d'affichage
    this.skyMapService.initializeMap('#aladin-lite-div');
    this.skyMapService.registerClickHandler((ra, dec) => {
      this.objectClicked.emit({ ra, dec });
    });
  }

  public onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    this.pointerStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  public onPointerMove(event: PointerEvent): void {
    if (!this.pointerStart || event.pointerId !== this.pointerStart.pointerId) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - this.pointerStart.x,
      event.clientY - this.pointerStart.y,
    );

    if (distance >= SkyMap.DRAG_THRESHOLD_PX) {
      this.isDragging.set(true);
    }
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  public stopDragging(): void {
    this.pointerStart = undefined;
    this.isDragging.set(false);
  }
}
