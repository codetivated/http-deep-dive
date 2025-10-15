import { Injectable, signal, inject } from '@angular/core';

import { Place } from './place.model';
import { catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
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

  // here we optimistically update the UI by updating the signal first
  // before the HTTP request
  addPlaceToUserPlaces(place: Place) {
    this.userPlaces.update((previousPlaces) => [...previousPlaces, place]);
    return this.httpClient.put(`${this.url}/user-places`, {
      placeId: place.id,
    });
  }

  removeUserPlace(place: Place) {}

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
