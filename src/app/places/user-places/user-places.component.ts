import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  isFetching = signal(false);
  error = signal('');
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);
  places = this.placesService.loadedUserPlaces;

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({
      error: (error: Error) => {
        this.error.set(error.message);
      },
      complete: () => this.isFetching.set(false),
    });
    this.destroyRef.onDestroy(() => {
      console.log('AvailablePlacesComponent destroyed');
      subscription.unsubscribe();
    });
  }

  onRemovePlace(place: Place) {
    const subscription = this.placesService.removeUserPlace(place).subscribe({
      next: (res) => {
        console.log('Place removed from user favorites:', res);
      },
      error: (error) => {
        console.error('Error removing place from favorites:', error);
      },
    });
    this.destroyRef.onDestroy(() => {
      console.log('AvailablePlacesComponent destroyed');
      subscription.unsubscribe();
    });
  }
}
