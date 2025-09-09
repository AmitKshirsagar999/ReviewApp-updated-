import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovieComponent } from './add-movie';

describe('AddMovie', () => {
  let component: AddMovieComponent;
  let fixture: ComponentFixture<AddMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
