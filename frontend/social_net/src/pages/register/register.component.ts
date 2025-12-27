import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../app/features/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form;
  loading = signal(false); 
  message = signal(''); 
  error = signal('');     

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nickname: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // async submit() {
  //   if (this.form.invalid) return;
  //   await this.auth.login(this.form.getRawValue());
  //   this.router.navigateByUrl('/');
  // }
  async submit() {
    if (this.form.invalid) return;
    
    this.loading.set(true);  // Start loading
    this.error.set('');      // Clear previous errors
    
    try {
      // Probably should be .register() not .login()
      await this.auth.register(this.form.getRawValue());
      this.router.navigateByUrl('/');
    } catch (err: any) {
      this.error.set(err.message || 'Registration failed');
    } finally {
      this.loading.set(false);  // Stop loading
    }
  }
  back() {
    this.router.navigateByUrl('/');
  }
}