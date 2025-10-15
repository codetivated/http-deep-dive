import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/user-places')
      .pipe(
        tap((resData) => console.log('data before map: ', resData)),
        map((resData) => resData.places),
        catchError((errorRes) => {
          console.log(errorRes);
          return throwError(
            () =>
              new Error(
                'Failed to fetch your favorite places. Please try again later.'
              )
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
