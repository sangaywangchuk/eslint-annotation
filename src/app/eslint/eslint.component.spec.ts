import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EslintComponent } from './eslint.component';

describe('EslintComponent', () => {
  let component: EslintComponent;
  let fixture: ComponentFixture<EslintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EslintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EslintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
