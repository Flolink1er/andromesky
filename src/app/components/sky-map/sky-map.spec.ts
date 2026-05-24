import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyMap } from './sky-map';

describe('SkyMap', () => {
  let component: SkyMap;
  let fixture: ComponentFixture<SkyMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkyMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkyMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
