import { inject, Injectable, signal } from '@angular/core';
import { IAstronomicalObject, IConstellation } from '../models/astronomical-object.model';
import { AstronomicalObjectService } from './astronomical-object.service';
import { ConstellationService } from './constellation.service';

declare let A: any;

@Injectable({
  providedIn: 'root',
})
export class SkyMapService {
  private static readonly CONSTELLATION_LINE_COLOR = '#60A5FA';
  private static readonly CONSTELLATION_STAR_COLOR = '#FFFFFF';
  private static readonly CONSTELLATION_STAR_RADIUS = 0.08;
  private static readonly CURRENT_OBJECT_COLOR = '#22D3EE';
  private static readonly SELECTION_COLOR = '#FBBF24';

  private aladin: any;
  private markerCatalog: any;
  private constellationOverlay: any;
  private selectionCatalog: any;
  private locationResultCatalog: any;
  private locationResultOverlay: any;
  private locationHintOverlay: any;

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
      sourceSize: 10,
    });
    this.aladin.addCatalog(this.selectionCatalog);

    this.markerCatalog = A.catalog({
      name: 'Current Object',
      shape: 'cross',
      color: SkyMapService.CURRENT_OBJECT_COLOR,
      sourceSize: 12,
    });
    this.aladin.addCatalog(this.markerCatalog);

    this.locationResultCatalog = A.catalog({
      name: 'Correct location',
      shape: 'cross',
      color: '#34D399',
      sourceSize: 12,
    });
    this.aladin.addCatalog(this.locationResultCatalog);

    this.constellationOverlay = A.graphicOverlay({
      color: '#60A5FA',
      lineWidth: 3,
      opacity: 0.8,
    });
    this.aladin.addOverlay(this.constellationOverlay);

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
    const marker = A.source(object.ra!, object.dec!, {});

    this.markerCatalog.addSources([marker]);
  }

  private clickCallback?: (ra: number, dec: number) => void;

  registerClickHandler(callback: (ra: number, dec: number) => void): void {
    this.clickCallback = callback;

    this.aladin.on('click', (position: any) => {
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
          color: '#FFFFFF',
          fill: true,
          lineWidth: 1,
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
      return 0.16;
    }

    if (star.magnitude <= 2) {
      return 0.12;
    }

    return 0.08;
  }

  public showSelectionMarker(ra: number, dec: number): void {
    this.selectionCatalog.clear();

    this.selectionCatalog.addSources([A.source(ra, dec, {})]);
  }

  public clearSelectionMarker(): void {
    this.selectionCatalog.clear();
  }

  public showLocationFeedback(
    selectedLocation: { ra: number; dec: number },
    correctObject: IAstronomicalObject,
  ): void {
    this.locationResultCatalog.clear();
    this.locationResultOverlay.removeAll();

    this.locationResultCatalog.addSources([A.source(correctObject.ra!, correctObject.dec!, {})]);
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
    this.constellationOverlay.removeAll();
  }
}
