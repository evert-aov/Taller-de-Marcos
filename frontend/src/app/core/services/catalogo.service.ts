import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogoResponse, FilterMarco } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CatalogoService {
  private readonly apiUrl = '/api/catalogo';

  constructor(private http: HttpClient) {}

  getCatalogo(filter?: FilterMarco): Observable<CatalogoResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.categoriaId) params = params.set('categoriaId', filter.categoriaId);
      if (filter.categoriaSlug) params = params.set('categoriaSlug', filter.categoriaSlug);
      if (filter.tipoMadera) params = params.set('tipoMadera', filter.tipoMadera);
      if (filter.precioMin !== undefined && filter.precioMin !== null) {
        params = params.set('precioMin', filter.precioMin.toString());
      }
      if (filter.precioMax !== undefined && filter.precioMax !== null) {
        params = params.set('precioMax', filter.precioMax.toString());
      }
      if (filter.disponible !== undefined && filter.disponible !== null) {
        params = params.set('disponible', filter.disponible.toString());
      }
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    }
    return this.http.get<CatalogoResponse>(this.apiUrl, { params });
  }

  getPdfUrl(filter?: FilterMarco): string {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.categoriaId) params.append('categoriaId', filter.categoriaId);
    if (filter?.tipoMadera) params.append('tipoMadera', filter.tipoMadera);
    if (filter?.disponible !== undefined) params.append('disponible', String(filter.disponible));
    const query = params.toString();
    return `${this.apiUrl}/pdf${query ? '?' + query : ''}`;
  }

  getHtmlUrl(filter?: FilterMarco): string {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.categoriaId) params.append('categoriaId', filter.categoriaId);
    if (filter?.tipoMadera) params.append('tipoMadera', filter.tipoMadera);
    if (filter?.disponible !== undefined) params.append('disponible', String(filter.disponible));
    const query = params.toString();
    return `${this.apiUrl}/html${query ? '?' + query : ''}`;
  }
}
