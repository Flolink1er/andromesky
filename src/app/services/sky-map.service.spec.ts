import { TestBed } from '@angular/core/testing';

import { SkyMapService } from './sky-map.service';

describe('SkyMapService', () => {
  let service: SkyMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkyMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
