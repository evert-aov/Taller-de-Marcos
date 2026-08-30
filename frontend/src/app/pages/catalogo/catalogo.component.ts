import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPhoto,
  heroFolder,
  heroArrowDownTray,
  heroGlobeAlt,
  heroMagnifyingGlass,
  heroArrowPath,
  heroLockClosed,
  heroEye,
  heroXMark,
  heroCheck,
  heroSparkles,
  heroAdjustmentsHorizontal,
  heroCube,
  heroArrowLeftOnRectangle,
  heroSquares2x2,
} from '@ng-icons/heroicons/outline';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AuthService } from '../../core/services/auth.service';
import { Marco, Categoria, FilterMarco } from '../../core/models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      heroPhoto,
      heroFolder,
      heroArrowDownTray,
      heroGlobeAlt,
      heroMagnifyingGlass,
      heroArrowPath,
      heroLockClosed,
      heroEye,
      heroXMark,
      heroCheck,
      heroSparkles,
      heroAdjustmentsHorizontal,
      heroCube,
      heroArrowLeftOnRectangle,
      heroSquares2x2,
    }),
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit, OnDestroy {
  marcos = signal<Marco[]>([]);
  categorias = signal<Categoria[]>([]);
  woodTypes = signal<string[]>([]);
  loading = signal<boolean>(true);

  // Filters
  searchTerm = '';
  selectedCategory = '';
  selectedWood = '';
  onlyAvailable = false;
  sortBy = 'recientes';

  // Selected marco for detail modal
  selectedMarco = signal<Marco | null>(null);
  detailWithCarton = signal<boolean>(false);

  // Map of marcoId -> boolean for carton option in catalog grid
  withCartonMap = signal<Record<string, boolean>>({});

  private focusListener = () => {
    this.loadCatalog(false);
  };

  constructor(
    private catalogoService: CatalogoService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadCatalog();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.focusListener);
      document.addEventListener('visibilitychange', this.focusListener);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.focusListener);
      document.removeEventListener('visibilitychange', this.focusListener);
    }
  }

  isVacioCategory(marco: Marco): boolean {
    const cat = marco.categoria || this.categorias().find((c) => c.id === marco.categoriaId);
    if (!cat) return false;
    return (
      cat.slug?.toLowerCase().includes('vacio') ||
      cat.nombre?.toLowerCase().includes('vacio') ||
      cat.nombre?.toLowerCase().includes('vacío')
    );
  }

  hasCartonOption(marco: Marco): boolean {
    const price = Number(marco.precioCarton);
    return !isNaN(price) && price > 0;
  }

  isCartonSelected(marcoId: string): boolean {
    return !!this.withCartonMap()[marcoId];
  }

  toggleCarton(marcoId: string) {
    this.withCartonMap.update((map) => ({
      ...map,
      [marcoId]: !map[marcoId],
    }));
  }

  getCartonPrice(marco: Marco): number {
    const price = Number(marco.precioCarton);
    return !isNaN(price) && price > 0 ? price : 0;
  }

  calculatePrice(marco: Marco): number {
    const base = Number(marco.precio) || 0;
    if (this.isCartonSelected(marco.id)) {
      return base + this.getCartonPrice(marco);
    }
    return base;
  }

  calculateDetailPrice(marco: Marco): number {
    const base = Number(marco.precio) || 0;
    if (this.detailWithCarton()) {
      return base + this.getCartonPrice(marco);
    }
    return base;
  }

  loadCatalog(showLoading = true) {
    if (showLoading) {
      this.loading.set(true);
    }
    const filter: FilterMarco = {
      search: this.searchTerm || undefined,
      categoriaId: this.selectedCategory || undefined,
      tipoMadera: this.selectedWood || undefined,
      disponible: this.onlyAvailable ? true : undefined,
      sortBy: this.sortBy || undefined,
    };

    this.catalogoService.getCatalogo(filter).subscribe({
      next: (data) => {
        this.marcos.set(data.marcos);
        this.categorias.set(data.categorias);
        this.woodTypes.set(data.woodTypes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar catálogo', err);
        this.loading.set(false);
      },
    });
  }

  onFilterChange() {
    this.loadCatalog();
  }

  setCategory(catId: string) {
    this.selectedCategory = catId;
    this.loadCatalog();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedWood = '';
    this.onlyAvailable = false;
    this.sortBy = 'recientes';
    this.loadCatalog();
  }

  get currentFilter(): FilterMarco {
    return {
      search: this.searchTerm || undefined,
      categoriaId: this.selectedCategory || undefined,
      tipoMadera: this.selectedWood || undefined,
      disponible: this.onlyAvailable ? true : undefined,
    };
  }

  downloadPdf() {
    const url = this.catalogoService.getPdfUrl(this.currentFilter);
    window.open(url, '_blank');
  }

  downloadHtml() {
    const url = this.catalogoService.getHtmlUrl(this.currentFilter);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogo-marcos-madera.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openDetail(marco: Marco) {
    this.selectedMarco.set(marco);
    this.detailWithCarton.set(this.isCartonSelected(marco.id));
  }

  closeDetail() {
    this.selectedMarco.set(null);
  }
}
