import { Injectable, signal, inject } from '@angular/core';

import { Place } from './place.model';
import { catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);
  private url = 'http://localhost:3000';

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      `${this.url}/places`,
      'Failed to fetch AVAILABLE places. Please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      `${this.url}/user-places`,
      'Failed to fetch your FAVORITE places. Please try again later.'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const previousPlaces = this.userPlaces();

    if (!previousPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...previousPlaces, place]);
    }
    return this.httpClient
      .put(`${this.url}/user-places`, {
        placeId: place.id,
      })
      .pipe(
        catchError((errorRes) => {
          console.log(errorRes);
          this.userPlaces.set(previousPlaces);
          this.errorService.showError('Failed to add place to favorites.');
          return throwError(
            () => new Error('Failed to add place to favorites.')
          );
        })
      );
  }

  removeUserPlace(place: Place) {
    const previousPlaces = this.userPlaces();

    if (previousPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(previousPlaces.filter((p) => p.id !== place.id));
    }

    return this.httpClient.delete(`${this.url}/user-places/${place.id}`).pipe(
      catchError((errorRes) => {
        console.log(errorRes);
        this.userPlaces.set(previousPlaces);
        this.errorService.showError('Failed to remove place from favorites.');
        return throwError(
          () => new Error('Failed to remove place from favorites.')
        );
      })
    );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      tap((resData) => console.log('data before map: ', resData)),
      map((resData) => resData.places),
      catchError((errorRes) => {
        console.log(errorRes);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
