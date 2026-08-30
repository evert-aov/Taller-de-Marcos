import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPhoto,
  heroAdjustmentsHorizontal,
  heroMagnifyingGlass,
  heroFunnel,
  heroCheck,
  heroXMark,
  heroEye,
  heroArrowDownTray,
  heroGlobeAlt,
  heroLockClosed,
  heroArrowLeftOnRectangle,
  heroSparkles,
  heroSquares2x2,
  heroArrowPath,
  heroFolder,
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
      heroAdjustmentsHorizontal,
      heroMagnifyingGlass,
      heroFunnel,
      heroCheck,
      heroXMark,
      heroEye,
      heroArrowDownTray,
      heroGlobeAlt,
      heroLockClosed,
      heroArrowLeftOnRectangle,
      heroSparkles,
      heroSquares2x2,
      heroArrowPath,
      heroFolder,
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

  // Grouped marcos by category computed
  marcosByCategory = computed(() => {
    const list = this.marcos();
    const groups: { categoryName: string; categoryDescription?: string; marcos: Marco[] }[] = [];
    const map = new Map<string, { categoryName: string; categoryDescription?: string; marcos: Marco[] }>();

    for (const marco of list) {
      const catName = marco.categoria?.nombre || 'Colección General';
      const catDesc = marco.categoria?.descripcion;
      if (!map.has(catName)) {
        const group = { categoryName: catName, categoryDescription: catDesc, marcos: [] };
        map.set(catName, group);
        groups.push(group);
      }
      map.get(catName)!.marcos.push(marco);
    }
    return groups;
  });

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

  downloadingImage = signal<boolean>(false);

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

  async downloadImage() {
    if (this.downloadingImage()) return;
    this.downloadingImage.set(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('catalogExportArea');
      if (!element) {
        throw new Error('No se encontró el contenedor del catálogo');
      }

      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution (Retina / 2.5x DPI)
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FAF6F0',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `catalogo-marcos-hd-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al generar imagen del catálogo', err);
      alert('Error al generar la imagen en alta resolución. Intente nuevamente.');
    } finally {
      this.downloadingImage.set(false);
    }
  }

  openDetail(marco: Marco) {
    this.selectedMarco.set(marco);
    this.detailWithCarton.set(this.isCartonSelected(marco.id));
  }

  closeDetail() {
    this.selectedMarco.set(null);
  }
}
