

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
 
})
export class LoginComponent {
  form!: FormGroup;
  loading = false;
  errorMessage = '';

  // ✅ Add signal for controlling animation
  showForm = signal(true);
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login(this.form.value).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          
          // Get return URL from query params or default to movies
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/movies';
          this.router.navigate([returnUrl]);
          
          this.loading = false; 
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = 'Login failed. Please check your credentials.';
          this.loading = false;
        }
      });
    }
  }
}



