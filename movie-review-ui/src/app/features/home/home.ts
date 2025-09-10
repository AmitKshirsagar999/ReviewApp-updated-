import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CarouselSliderComponent } from '../../carousel-slider/carousel-slider';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselSliderComponent,MatIconModule,RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  slides = [
  { img: 'assets/images/image1.jpg', title: 'Discover Fresh Hits' },
  { img: 'assets/images/image2.jpg', title: 'Best of 2025' },
  { img: 'assets/images/image3.jpg', title: 'Fan Favorites' },
  { img: 'assets/images/image4.jpg', title: 'Critically Acclaimed' }
];

}



