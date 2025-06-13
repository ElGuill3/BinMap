import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Login } from '../../models/login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule
  ]
})
export class LoginPage implements OnInit {
  
  loginForm!: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;

  // Patrones de validación
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailPattern)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      rememberMe: [false]
    });
  }

  // Getters para acceder fácilmente a los controles del formulario
  get email(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  // Función para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Funciones para el indicador de fortaleza de contraseña
  getPasswordStrengthValue(): number {
    const password = this.password?.value || '';
    let strength = 0;
    
    if (password.length >= 8) strength += 0.25;
    if (/[a-z]/.test(password)) strength += 0.25;
    if (/[A-Z]/.test(password)) strength += 0.25;
    if (/\d/.test(password)) strength += 0.125;
    if (/[@$!%*?&]/.test(password)) strength += 0.125;
    
    return strength;
  }

  getPasswordStrengthText(): string {
    const value = this.getPasswordStrengthValue();
    if (value < 0.25) return 'Muy débil';
    if (value < 0.5) return 'Débil';
    if (value < 0.75) return 'Media';
    if (value < 1) return 'Fuerte';
    return 'Muy fuerte';
  }

  getPasswordStrengthColor(): string {
    const value = this.getPasswordStrengthValue();
    if (value < 0.25) return 'danger';
    if (value < 0.5) return 'warning';
    if (value < 0.75) return 'primary';
    return 'success';
  }

  // Función principal para el envío del formulario
  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...'
      });
      await loading.present();

      try {
        const credentials: Login = this.loginForm.value;
        console.log('Intentando iniciar sesión con:', credentials.email);
        
        this.authService.login(credentials).subscribe({
          next: (response) => {
            console.log('Login exitoso:', response);
            this.showSuccessToast('¡Inicio de sesión exitoso!');
        this.router.navigate(['/tabs/home']);
            loading.dismiss();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error en login:', error);
            let errorMsg = 'Credenciales inválidas. Por favor intenta de nuevo.';
            
            if (error.status === 0) {
              errorMsg = 'No se pudo conectar al servidor. Verifica tu conexión a internet y que el servidor esté funcionando.';
            } else if (error.error) {
              if (error.error.non_field_errors) {
                errorMsg = error.error.non_field_errors[0];
              } else if (error.error.detail) {
                errorMsg = error.error.detail;
              } else if (error.message) {
                errorMsg = error.message;
              }
            }
            
            this.showErrorAlert('Error de autenticación', errorMsg);
            loading.dismiss();
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error inesperado:', error);
        this.showErrorAlert('Error inesperado', 'Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.');
        loading.dismiss();
        this.isLoading = false;
      }
    } else {
      await this.showValidationErrors();
    }
  }

  // Función para mostrar errores de validación
  private async showValidationErrors(): Promise<void> {
    const errors: string[] = [];
    
    if (this.email?.errors) {
      if (this.email.errors['required']) errors.push('El correo electrónico es requerido');
      if (this.email.errors['email'] || this.email.errors['pattern']) errors.push('El formato del correo no es válido');
    }
    
    if (this.password?.errors) {
      if (this.password.errors['required']) errors.push('La contraseña es requerida');
      if (this.password.errors['minlength']) errors.push('La contraseña debe tener al menos 8 caracteres');
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

  // Funciones auxiliares para mostrar mensajes
  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async showErrorAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}