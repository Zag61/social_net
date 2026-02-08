import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Broadcaster } from './broadcaster';

describe('Broadcaster', () => {
  let component: Broadcaster;
  let fixture: ComponentFixture<Broadcaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Broadcaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Broadcaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
