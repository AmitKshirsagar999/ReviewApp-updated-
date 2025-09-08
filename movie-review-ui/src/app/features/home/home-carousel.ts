// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// // Swiper core + angular wrapper
// import SwiperCore from 'swiper';
// import { SwiperModule } from 'swiper/angular';

// // ✅ Swiper v11+ modules (import from swiper/modules)
// import { Autoplay, Keyboard, A11y, Lazy, EffectCoverflow } from 'swiper/modules';

// // install modules into Swiper
// SwiperCore.use([Autoplay, Keyboard, A11y, Lazy, EffectCoverflow]);

// @Component({
//   selector: 'app-home-carousel',
//   standalone: true,
//   imports: [CommonModule, RouterLink, SwiperModule],
//   templateUrl: './home-carousel.html',
//   styleUrls: ['./home-carousel.scss']
// })
// export class HomeCarouselComponent implements OnInit {
//   @Input() slides: Array<{ id: string | number; title: string; image: string; link?: string }> = [];

//   autoplayConfig: any = {
//     delay: 3200,
//     pauseOnMouseEnter: true,
//     disableOnInteraction: false
//   };

//   reducedMotion = false;

//   ngOnInit(): void {
//     this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//     if (this.reducedMotion) {
//       this.autoplayConfig = false;
//     }
//   }
// }
