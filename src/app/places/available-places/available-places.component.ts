import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

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

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(
        tap((resData) => console.log('data before map: ', resData)),
        map((resData) => resData.places),
        catchError((errorRes) => {
          console.log(errorRes);
          return throwError(
            () => new Error('Failed to fetch places. Please try again later.')
          );
        })
      )
      .subscribe({
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
}
