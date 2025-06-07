import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonicModule, 
  AlertController, 
  ToastController,
  LoadingController
} from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';

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

  // Patrones de validación
  private namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Contraseña: mínimo 8 caracteres, no solo números
  private passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.pattern(this.namePattern)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.pattern(this.namePattern)
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(this.emailPattern)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Registrando usuario...'
      });
      await loading.present();
      
      try {
        const userData = {
          username: this.registerForm.value.email,
          first_name: this.registerForm.value.firstName,
          last_name: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        };

        await this.authService.register(userData).toPromise();
        await this.showSuccessMessage();
        this.router.navigate(['/login']);
        
      } catch (error) {
        await this.showErrorMessage('Error al registrar usuario. Intenta nuevamente.');
      } finally {
        this.isLoading = false;
        await loading.dismiss();
      }
    } else {
      await this.showValidationErrors();
    }
  }

  private async showValidationErrors() {
    const errors: string[] = [];
    
    const firstNameControl = this.registerForm.get('firstName');
    if (firstNameControl?.errors) {
      const firstNameErrors = firstNameControl.errors;
      if (firstNameErrors['required']) errors.push('El nombre es requerido');
      if (firstNameErrors['pattern']) errors.push('El nombre solo debe contener letras y espacios');
    }
    
    const lastNameControl = this.registerForm.get('lastName');
    if (lastNameControl?.errors) {
      const lastNameErrors = lastNameControl.errors;
      if (lastNameErrors['required']) errors.push('El apellido es requerido');
      if (lastNameErrors['pattern']) errors.push('El apellido solo debe contener letras y espacios');
    }
    
    const emailControl = this.registerForm.get('email');
    if (emailControl?.errors) {
      const emailErrors = emailControl.errors;
      if (emailErrors['required']) errors.push('El email es requerido');
      if (emailErrors['pattern']) {
        errors.push('El formato del email no es válido');
      }
    }
    
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.errors) {
      const passwordErrors = passwordControl.errors;
      if (passwordErrors['required']) errors.push('La contraseña es requerida');
      if (passwordErrors['minlength']) errors.push('La contraseña debe tener al menos 8 caracteres');
      if (passwordErrors['pattern']) {
        errors.push('La contraseña debe contener al menos una letra y un número');
      }
    }
    
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    if (confirmPasswordControl?.errors) {
      const confirmPasswordErrors = confirmPasswordControl.errors;
      if (confirmPasswordErrors['required']) errors.push('Debes confirmar la contraseña');
      if (confirmPasswordErrors['passwordMismatch']) {
        errors.push('Las contraseñas no coinciden');
      }
    }

    if (errors.length > 0) {
      const alert = await this.alertController.create({
        header: 'Errores de validación',
        message: errors.join('<br>'),
        buttons: ['OK']
      });
      await alert.present();
    }
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
}
