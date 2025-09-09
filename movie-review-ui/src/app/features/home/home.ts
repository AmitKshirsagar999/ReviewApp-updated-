import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule,RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {}



