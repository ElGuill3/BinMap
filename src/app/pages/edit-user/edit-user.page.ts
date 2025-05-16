import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
export class EditUserPage implements OnInit {
  @ViewChild('input') input!: IonInput;

  form: FormGroup;
  user$: Observable<User>;

  ionViewDidEnter() {
    setTimeout(() => {
      this.input.setFocus();
    }, 100);
  }

  onInputFilter(event: CustomEvent, controlName: 'name' | 'description') {
    const value = (event.target as HTMLIonInputElement).value ?? '';

    const patterns = {
      name: /[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+/g,
      description: /[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s.,¡!¿?()"'/-]+/g,
    };

    const filteredValue = (value as string).replace(patterns[controlName], '');

    this.form.get(controlName)?.setValue(filteredValue);
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private location: Location
  ) {
    this.form = this.fb.group({
      name: [''],
      avatar: [''],
      description: [''],
    });

    this.user$ = this.userService.getUser();
  }

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.form.patchValue(user);
    });
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    const updatedUser = this.form.value;
    this.userService.setUser(updatedUser).subscribe((data) => {
      console.log('Usuario Actualizado', data);
    });
  }

  formSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.save();
    this.goBack();
  }

  async openCamera(): Promise<void> {
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
