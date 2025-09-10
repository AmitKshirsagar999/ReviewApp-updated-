import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-slider.html',
  styleUrls: ['./carousel-slider.scss'],
   schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- Add this line!
})
export class CarouselSliderComponent {
  @Input() slides: { img: string, title: string }[] = [];
}
