import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marco, FilterMarco } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MarcosService {
  private readonly apiUrl = '/api/marcos';

  constructor(private http: HttpClient) {}

  getAll(filter?: FilterMarco): Observable<Marco[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.categoriaId) params = params.set('categoriaId', filter.categoriaId);
      if (filter.tipoMadera) params = params.set('tipoMadera', filter.tipoMadera);
      if (filter.disponible !== undefined && filter.disponible !== null) {
        params = params.set('disponible', filter.disponible.toString());
      }
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    }
    return this.http.get<Marco[]>(this.apiUrl, { params });
  }

  getWoodTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/wood-types`);
  }

  getById(id: string): Observable<Marco> {
    return this.http.get<Marco>(`${this.apiUrl}/${id}`);
  }

  create(marco: Partial<Marco>): Observable<Marco> {
    return this.http.post<Marco>(this.apiUrl, marco);
  }

  update(id: string, marco: Partial<Marco>): Observable<Marco> {
    return this.http.put<Marco>(`${this.apiUrl}/${id}`, marco);
  }

  toggleDisponible(id: string): Observable<Marco> {
    return this.http.patch<Marco>(`${this.apiUrl}/${id}/toggle-disponible`, {});
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string }>(`${this.apiUrl}/upload`, formData);
  }
}
