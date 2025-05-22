import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonicModule, 
  AlertController, 
  ToastController 
} from '@ionic/angular';

// Interfaz para el usuario
interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};:\'",.<>/?]).+$')
      ]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      try {
        const userData: User = {
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        };

        await this.registerUser(userData);
        await this.showSuccessMessage();
        this.router.navigate(['/login']);
        
      } catch (error) {
        await this.showErrorMessage('Error al registrar usuario. Intenta nuevamente.');
      } finally {
        this.isLoading = false;
      }
    } else {
      await this.showErrorMessage('Por favor, completa todos los campos correctamente.');
      this.markFormGroupTouched();
    }
  }

  private async registerUser(userData: User): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = true;
        if (success) {
          console.log('Usuario registrado:', userData);
          resolve();
        } else {
          reject(new Error('Error en el registro'));
        }
      }, 2000);
    });
  }

  private async showSuccessMessage() {
    const toast = await this.toastController.create({
      message: '¡Registro exitoso! Ahora puedes iniciar sesión.',
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  private async showErrorMessage(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
