
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  form!: FormGroup;
  loading = false;         //Loading state
  errorMessage = '';            //Error message
  successMessage = '';       //Success message
  
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;        // Set loading
      this.errorMessage = '';     // Clear previous errors
      this.successMessage = '';   
      
      this.authService.register(this.form.value).subscribe({
        next: () => {
          this.successMessage = 'Registration successful! Redirecting to movies...';
          this.loading = false;
          
          
          setTimeout(() => {
            this.router.navigate(['/movies']);
          }, 2000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.errorMessage = 'Registration failed. Please try again.';
          this.loading = false;
        }

      });


    }
  }

  
}
