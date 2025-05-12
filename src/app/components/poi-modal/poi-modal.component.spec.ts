import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoiModalComponent } from './poi-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

describe('PoiModalComponent', () => {
  let component: PoiModalComponent;
  let fixture: ComponentFixture<PoiModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PoiModalComponent],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Para ignorar componentes de Ionic/Angular Material
    }).compileComponents();

    fixture = TestBed.createComponent(PoiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize inputs', () => {
    component.title = 'Test Title';
    component.info = 'Test Info';
    component.image = 'test.jpg';
    component.video = 'test.mp4';
    expect(component.title).toEqual('Test Title');
    expect(component.info).toEqual('Test Info');
  });

  it('should toggle speech', async () => {
    spyOn<any>(component, 'toggleSpeech').and.callThrough();
    await component.toggleSpeech();
    expect(component.isSpeaking).toBeFalse(); // porque después de hablar se pone false
  });
});
