import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { sinistro } from '../models/sinistro.model';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SinistriService {
  link = '/api/sinistri/';

  private sinistriSubject = new BehaviorSubject<sinistro[]>([]);
  obsSinistri = this.sinistriSubject.asObservable();
  sinistri: sinistro[] = [];

  constructor(public http: HttpClient) {}

  askSinistri() {
    this.http.get<sinistro[]>(`${this.link}sinistri`).subscribe({
      next: (data) => {
        this.sinistri = data;
        this.sinistriSubject.next(data);
        console.log("Sinistri caricati:", data);
      },
      error: (err) => console.error("Errore download sinistri:", err)
    });
  }

  createSinistro(nuovoSinistro: sinistro): Observable<any> {
    return this.http.post(`${this.link}sinistro`, nuovoSinistro).pipe(
      tap(() => this.askSinistri())
    );
  }

  uploadImmagini(sinistroId: string, files: File[]): Observable<any> {
    const file = files[0];
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // rimuove "data:image/...;base64,"
        this.http.post(`${this.link}sinistro/${sinistroId}/immagini`, {
          immagine_base64: base64
        }).subscribe({
          next: (res) => { observer.next(res); observer.complete(); },
          error: (err) => observer.error(err)
        });
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file);
    });
  }
}