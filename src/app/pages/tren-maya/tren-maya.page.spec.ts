import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrenMayaPage } from './tren-maya.page';

describe('TrenMayaPage', () => {
  let component: TrenMayaPage;
  let fixture: ComponentFixture<TrenMayaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrenMayaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
