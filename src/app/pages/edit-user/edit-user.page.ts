import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonAvatar, IonButton, IonLabel, IonInput, IonItem } from '@ionic/angular/standalone';
import { UserService, User } from 'src/app/services/user.service';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonAvatar, IonButton, IonLabel, IonInput, IonItem]
})
export class EditUserPage implements OnInit {

  form: FormGroup;
  user$: Observable<User>;

  constructor(private fb: FormBuilder, private userService: UserService, private location: Location) {
    this.form = this.fb.group ({
      name: [''],
      avatar: [''],
      description: ['']
    });

    this.user$ = this.userService.getUser();
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
    this.form.patchValue(user);
    });
  }

  save(): void {
    const updatedUser = this.form.value;
    this.userService.setUser(updatedUser).subscribe(data => {
      console.log('Usuario Actualizado', data);
      this.location.back();
    
    })
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
        avatar: base64Image
      });
    } catch (error) {
      console.error('Error al tomar la foto: ', error);
    }
  }

}
