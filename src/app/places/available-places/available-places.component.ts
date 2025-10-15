import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (resData) => {
        console.log('data after map and subscribe: ', resData);
        this.places.set(resData);
      },
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

  onSelectPlace(selectedPlace: Place) {
    console.log(selectedPlace);
    const subscription = this.placesService
      .addPlaceToUserPlaces(selectedPlace.id)
      .subscribe({
        next: (res) => {
          console.log('Place added to user favorites:', res);
        },
        error: (error) => {
          console.error('Error adding place to favorites:', error);
        },
      });
    this.destroyRef.onDestroy(() => {
      console.log('AvailablePlacesComponent destroyed');
      subscription.unsubscribe();
    });
  }
}
