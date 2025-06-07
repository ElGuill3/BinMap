import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  IonAvatar,
  IonButton,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { Observable, Subscription } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { first } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonAvatar,
    IonButton,
    IonInput,
    IonTextarea,
  ],
})
export class EditUserPage implements OnInit, OnDestroy {
  @ViewChild('input') input!: IonInput;

  form: FormGroup;
  user$: Observable<User>;
  userEmail: string = '';
  originalUser: any = {};
  private userSubscription!: Subscription;
  private routerSubscription!: Subscription;
  isSaving: boolean = false;
  isNavigatingAway: boolean = false;
  isInitialLoad: boolean = true;

  ionViewDidEnter() {
    setTimeout(() => {
      this.input.setFocus();
    }, 100);
  }

  onInputFilter(event: CustomEvent, controlName: 'first_name' | 'last_name' | 'description') {
    const value = (event.target as HTMLIonInputElement).value ?? '';

    const patterns = {
      first_name: /[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+/g,
      last_name: /[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+/g,
      description: /[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s.,¡!¿?()"'/-]+/g,
    };

    const filteredValue = (value as string).replace(patterns[controlName], '');
    
    if (this.isInitialLoad) return;
    
    this.form.get(controlName)?.setValue(filteredValue, { emitEvent: true });
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private location: Location,
    private router: Router
  ) {
    this.form = this.fb.group({
      first_name: [''],
      last_name: [''],
      avatar: [''],
      description: [''],
    });

    this.user$ = this.userService.getUser();
  }

  ngOnInit(): void {
    this.isInitialLoad = true;
    this.userSubscription = this.user$.pipe(first()).subscribe((user) => {
      this.originalUser = { ...user };
      this.form.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        description: user.description
      }, { emitEvent: false });
      this.userEmail = user.email;
      this.form.enable();
      setTimeout(() => {
        this.isInitialLoad = false;
      }, 100);
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && !this.isSaving) {
        this.isNavigatingAway = true;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  goBack(): void {
    if (!this.isSaving) {
      this.isNavigatingAway = true;
      this.router.navigate(['/profile']);
    }
  }

  formSubmit(): void {
    if (this.isInitialLoad || this.isSaving) {
      return;
    }

    const updatedUser = {
      ...this.form.value,
      email: this.userEmail
    };

    // Verificar si hay cambios reales comparando valores exactos
    const hasChanges = 
      updatedUser.first_name !== this.originalUser.first_name ||
      updatedUser.last_name !== this.originalUser.last_name ||
      updatedUser.avatar !== this.originalUser.avatar ||
      updatedUser.description !== this.originalUser.description;

    if (!hasChanges) {
      this.goBack();
      return;
    }

    this.isSaving = true;
    this.isNavigatingAway = false;
    this.form.disable();
    this.save();
  }

  save(): void {
    if (!this.isSaving || this.isInitialLoad) {
      return;
    }

    const updatedUser = {
      ...this.form.value,
      email: this.userEmail
    };

    this.userService.setUser(updatedUser).subscribe({
      next: (data) => {
        this.isSaving = false;
        this.isNavigatingAway = true;
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.isSaving = false;
        this.isNavigatingAway = false;
        this.form.enable();
      }
    });
  }

  async openCamera(): Promise<void> {
    if (this.isInitialLoad) return;
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const base64Image = image.dataUrl;

      this.form.patchValue({
        avatar: base64Image,
      });
    } catch (error) {
      console.error('Error al tomar la foto: ', error);
    }
  }
}
