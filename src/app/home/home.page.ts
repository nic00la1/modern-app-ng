import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { catchError, finalize } from 'rxjs';
import { MovieResult } from '../services/interfaces';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  private movieService = inject(MovieService);
  private currentPage = 1;
  private error = null;
  private isLoading = false;
  private movies: MovieResult[] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor() {
    this.loadMovies();
  }

  loadMovies(event?: InfiniteScrollCustomEvent) {
    //
    this.error = null;

    if (!event) {
      this.isLoading = true; // show loading spinner when loading first page
    }

    // call movie service to get top rated movies
    this.movieService
      .getTopRatedMovies(this.currentPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        }), // hide loading spinner when observable completes
        catchError((err: any) => {
          console.log(err);

          this.error = err.error.status_message;
          return [];
        }) // catch error and return empty array
      )
      .subscribe({
        next: (res) => {
          console.log(res);

          this.movies.push(...res.results);
          if (event) {
            event.target.disabled = res.total_pages === this.currentPage; // disable infinite scroll when there are no more pages to load
          }
        },
      });
  }

  loadMore(event: InfiniteScrollCustomEvent) {}
}
