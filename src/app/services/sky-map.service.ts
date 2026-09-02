import { inject, Injectable, signal } from '@angular/core';
import { IAstronomicalObject, IConstellation } from '../models/astronomical-object.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { ConstellationService } from './constellation.service';

declare let A: any;

@Injectable({
  providedIn: 'root',
})
export class SkyMapService {
  private static readonly DRAG_THRESHOLD_PX = 8;
  private static readonly CONSTELLATION_LINE_COLOR = '#7DD3FC';
  private static readonly CONSTELLATION_STAR_COLOR = '#DBEAFE';
  private static readonly CONSTELLATION_STAR_RADIUS = 0.055;
  private static readonly CURRENT_OBJECT_COLOR = '#22D3EE';
  private static readonly SELECTION_COLOR = '#FBBF24';

  private aladin: any;
  private markerCatalog: any;
  private constellationOverlay: any;
  private selectionCatalog: any;
  private selectionOverlay: any;
  private currentObjectOverlay: any;
  private locationResultCatalog: any;
  private locationResultOverlay: any;
  private locationHintOverlay: any;
  private pointerStart?: { pointerId: number; x: number; y: number };
  private didDrag = false;

  private readonly astronomicalObject = inject(AstronomicalObjectService);
  private readonly constellation = inject(ConstellationService);

  public initializeMap(container: string): void {
    const mapContainer = document.querySelector<HTMLElement>(container);
    const blockSecondaryClick = (event: MouseEvent | PointerEvent): void => {
      if (event.button !== 2) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    mapContainer?.addEventListener('pointerdown', blockSecondaryClick, true);
    mapContainer?.addEventListener('mousedown', blockSecondaryClick, true);
    mapContainer?.addEventListener(
      'contextmenu',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    mapContainer?.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }

      this.pointerStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      this.didDrag = false;
    }, true);

    mapContainer?.addEventListener('pointermove', (event) => {
      if (!this.pointerStart || event.pointerId !== this.pointerStart.pointerId) {
        return;
      }

      const distance = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
      if (distance >= SkyMapService.DRAG_THRESHOLD_PX) {
        this.didDrag = true;
      }
    }, true);

    const releasePointer = (event: PointerEvent): void => {
      if (!this.pointerStart || event.pointerId !== this.pointerStart.pointerId) {
        return;
      }

      this.pointerStart = undefined;

      // Aladin emits its click after pointerup. Reset after that click has had a chance to run.
      window.setTimeout(() => (this.didDrag = false), 0);
    };
    mapContainer?.addEventListener('pointerup', releasePointer, true);
    mapContainer?.addEventListener('pointercancel', releasePointer, true);

    this.aladin = A.aladin(container, {
      survey: 'P/DSS2/color',

      target: 'Orion',

      fov: 20,

      showFullscreenControl: false,

      showLayersControl: false,

      showGotoControl: false,

      showZoomControl: false,

      showReticle: false,

      showFrame: false,

      showCooLocation: false,

      showFov: false,

      showProjectionControl: false,
    });

    this.selectionCatalog = A.catalog({
      name: 'Selection',
      shape: 'rhomb',
      color: SkyMapService.SELECTION_COLOR,
      sourceSize: 7,
    });
    this.aladin.addCatalog(this.selectionCatalog);

    this.markerCatalog = A.catalog({
      name: 'Current Object',
      shape: 'cross',
      color: SkyMapService.CURRENT_OBJECT_COLOR,
      sourceSize: 9,
    });
    this.aladin.addCatalog(this.markerCatalog);

    this.locationResultCatalog = A.catalog({
      name: 'Correct location',
      shape: 'cross',
      color: '#34D399',
      sourceSize: 9,
    });
    this.aladin.addCatalog(this.locationResultCatalog);

    this.constellationOverlay = A.graphicOverlay({
      color: SkyMapService.CONSTELLATION_LINE_COLOR,
      lineWidth: 2,
      opacity: 0.72,
    });
    this.aladin.addOverlay(this.constellationOverlay);

    this.selectionOverlay = A.graphicOverlay({
      color: '#FDE68A',
      lineWidth: 2,
      opacity: 0.9,
    });
    this.aladin.addOverlay(this.selectionOverlay);

    this.currentObjectOverlay = A.graphicOverlay({
      color: '#67E8F9',
      lineWidth: 2,
      opacity: 0.9,
    });
    this.aladin.addOverlay(this.currentObjectOverlay);

    this.locationResultOverlay = A.graphicOverlay({
      color: '#FBBF24',
      lineWidth: 2,
      opacity: 0.9,
    });
    this.aladin.addOverlay(this.locationResultOverlay);

    this.locationHintOverlay = A.graphicOverlay({
      color: '#A78BFA',
      lineWidth: 2,
      opacity: 0.8,
    });
    this.aladin.addOverlay(this.locationHintOverlay);
  }

  public goToObject(object: IAstronomicalObject) {
    if (!this.aladin) {
      return;
    }
    this.markerCatalog.clear();

    this.aladin.gotoRaDec(object.ra!, object.dec!);

    this.highlightObject(object);
    if (object.constellationId) {
      const constellation = this.constellation.findById(object.constellationId);

      if (constellation) {
        this.highlightConstellation(constellation);
      } else {
        this.constellationOverlay.removeAll();
      }
    } else {
      this.constellationOverlay.removeAll();
    }
  }

  private highlightObject(object: IAstronomicalObject): void {
    if (object.ra === undefined || object.dec === undefined) {
      return;
    }

    this.markerCatalog.clear();
    this.currentObjectOverlay.removeAll();
    const marker = A.source(object.ra!, object.dec!, {});

    this.markerCatalog.addSources([marker]);
    this.currentObjectOverlay.add(
      A.circle(object.ra!, object.dec!, this.getMarkerRadius(), {
        color: '#A5F3FC',
        fill: false,
        lineWidth: 2,
        opacity: 0.9,
      }),
    );
  }

  private clickCallback?: (ra: number, dec: number) => void;

  registerClickHandler(callback: (ra: number, dec: number) => void): void {
    this.clickCallback = callback;

    this.aladin.on('click', (position: any) => {
      if (this.didDrag) {
        return;
      }

      callback(position.ra, position.dec);
    });
  }

  highlightConstellation(constellation: IConstellation): void {
    this.constellationOverlay.removeAll();
    const stars = new Map(this.astronomicalObject.objects().map((star) => [star.target, star]));
    const displayedStars = new Map<string, IAstronomicalObject>();

    for (const segment of constellation.segments) {
      const from = stars.get(segment.fromTarget);
      const to = stars.get(segment.toTarget);

      if (!from || !to) {
        continue;
      }
      displayedStars.set(from.target, from);
      displayedStars.set(to.target, to);

      const line = A.polyline([
        [from.ra!, from.dec!],
        [to.ra!, to.dec!],
      ]);
      this.constellationOverlay.addFootprints(line);
    }

    for (const star of displayedStars.values()) {
      this.constellationOverlay.add(
        A.circle(star.ra!, star.dec!, this.getStarRadius(star), {
          color: SkyMapService.CONSTELLATION_STAR_COLOR,
          fill: true,
          lineWidth: 0.5,
          opacity: 0.82,
        }),
      );
    }

    // this.constellationStarCatalog.addSources(markers);
  }

  private getStarRadius(star: IAstronomicalObject): number {
    if (star.magnitude === undefined) {
      return 0.08;
    }

    if (star.magnitude <= 1) {
      return 0.11;
    }

    if (star.magnitude <= 2) {
      return 0.08;
    }

    return SkyMapService.CONSTELLATION_STAR_RADIUS;
  }

  private getMarkerRadius(): number {
    const [fovWidth, fovHeight] = this.aladin.getFov();
    return Math.max(0.035, Math.min(0.16, Math.min(fovWidth, fovHeight) * 0.012));
  }

  public showSelectionMarker(ra: number, dec: number): void {
    this.selectionCatalog.clear();
    this.selectionOverlay.removeAll();

    this.selectionCatalog.addSources([A.source(ra, dec, {})]);
    this.selectionOverlay.add(
      A.circle(ra, dec, this.getMarkerRadius(), {
        color: '#FDE68A',
        fill: false,
        lineWidth: 2,
        opacity: 0.9,
      }),
    );
  }

  public clearSelectionMarker(): void {
    this.selectionCatalog.clear();
    this.selectionOverlay.removeAll();
  }

  public showLocationFeedback(
    selectedLocation: { ra: number; dec: number },
    correctObject: IAstronomicalObject,
  ): void {
    this.locationResultCatalog.clear();
    this.locationResultOverlay.removeAll();

    this.locationResultCatalog.addSources([A.source(correctObject.ra!, correctObject.dec!, {})]);
    this.locationResultOverlay.add(
      A.circle(correctObject.ra!, correctObject.dec!, this.getMarkerRadius(), {
        color: '#6EE7B7',
        fill: false,
        lineWidth: 2,
        opacity: 0.95,
      }),
    );
    this.locationResultOverlay.addFootprints(
      A.polyline([
        [selectedLocation.ra, selectedLocation.dec],
        [correctObject.ra!, correctObject.dec!],
      ]),
    );
  }

  public clearLocationFeedback(): void {
    this.locationResultCatalog.clear();
    this.locationResultOverlay.removeAll();
  }

  public showLocationHint(object: IAstronomicalObject): void {
    const [fovWidth, fovHeight] = this.aladin.getFov();
    const radius = Math.min(fovWidth, fovHeight) * 0.28;
    const angle = Math.random() * Math.PI * 2;
    const offset = radius * (0.45 + Math.random() * 0.2);
    const objectDeclination = (object.dec! * Math.PI) / 180;
    const centreDec = Math.max(-85, Math.min(85, object.dec! + offset * Math.sin(angle)));
    const centreRa =
      (object.ra! + offset * Math.cos(angle) / Math.max(0.2, Math.cos(objectDeclination)) + 360) % 360;

    this.locationHintOverlay.removeAll();
    this.aladin.gotoRaDec(centreRa, centreDec);
    this.locationHintOverlay.add(
      A.circle(centreRa, centreDec, radius, {
        color: '#C4B5FD',
        fill: false,
        lineWidth: 3,
        opacity: 0.95,
      }),
    );
  }

  public clearLocationHint(): void {
    this.locationHintOverlay.removeAll();
  }

  public clearHighlightedObject(): void {
    this.markerCatalog.clear();
    this.currentObjectOverlay.removeAll();
    this.constellationOverlay.removeAll();
  }
}
