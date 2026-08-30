import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPlus,
  heroPencilSquare,
  heroTrash,
  heroPhoto,
  heroMagnifyingGlass,
  heroArrowUpTray,
  heroCheck,
  heroXMark,
  heroCheckCircle,
  heroExclamationTriangle,
  heroTag,
  heroCube,
} from '@ng-icons/heroicons/outline';
import { MarcosService } from '../../../core/services/marcos.service';
import { CategoriasService } from '../../../core/services/categorias.service';
import { Marco, Categoria, FilterMarco } from '../../../core/models';

@Component({
  selector: 'app-marcos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [
    provideIcons({
      heroPlus,
      heroPencilSquare,
      heroTrash,
      heroPhoto,
      heroMagnifyingGlass,
      heroArrowUpTray,
      heroCheck,
      heroXMark,
      heroCheckCircle,
      heroExclamationTriangle,
      heroTag,
      heroCube,
    }),
  ],
  templateUrl: './marcos-admin.component.html',
  styleUrl: './marcos-admin.component.scss',
})
export class MarcosAdminComponent implements OnInit, OnDestroy {
  marcos = signal<Marco[]>([]);
  categorias = signal<Categoria[]>([]);
  woodTypes = signal<string[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  uploadingImage = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filters
  searchTerm = '';
  selectedCategory = '';
  selectedWood = '';

  // Modal State
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentId: string | null = null;

  // Form Model
  formNombre = '';
  formCategoriaId = '';
  formDimensiones = '';
  formTipoMadera = '';
  formPrecio = 0;
  formPrecioCarton = 5;
  formImagenUrl = '';
  formDisponible = true;

  // Image preview helper
  imagePreview = signal<string>('');

  private focusListener = () => {
    this.loadCategorias();
    this.loadWoodTypes();
    this.loadMarcos(false);
  };

  constructor(
    private marcosService: MarcosService,
    private categoriasService: CategoriasService,
  ) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadWoodTypes();
    this.loadMarcos();
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

  isCategoriaVacio(): boolean {
    const cat = this.categorias().find((c) => c.id === this.formCategoriaId);
    if (!cat) return false;
    return (
      cat.slug.toLowerCase().includes('vacio') ||
      cat.nombre.toLowerCase().includes('vacio') ||
      cat.nombre.toLowerCase().includes('vacío')
    );
  }

  loadCategorias() {
    this.categoriasService.getAll().subscribe({
      next: (data) => {
        this.categorias.set(data);
        if (!this.formCategoriaId && data.length > 0) {
          this.formCategoriaId = data[0].id;
        }
      },
      error: (err) => console.error('Error cargando categorías', err),
    });
  }

  loadWoodTypes() {
    this.marcosService.getWoodTypes().subscribe({
      next: (data) => this.woodTypes.set(data),
      error: (err) => console.error('Error cargando tipos de madera', err),
    });
  }

  loadMarcos(showLoading = true) {
    if (showLoading) {
      this.loading.set(true);
    }
    const filter: FilterMarco = {
      search: this.searchTerm || undefined,
      categoriaId: this.selectedCategory || undefined,
      tipoMadera: this.selectedWood || undefined,
    };

    this.marcosService.getAll(filter).subscribe({
      next: (data) => {
        this.marcos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al cargar marcos');
      },
    });
  }

  onFilterChange() {
    this.loadMarcos();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentId = null;
    this.formNombre = '';
    this.formCategoriaId = this.categorias().length > 0 ? this.categorias()[0].id : '';
    this.formDimensiones = '30x40 cm';
    this.formTipoMadera = 'Roble';
    this.formPrecio = 45;
    this.formPrecioCarton = 5;
    this.formImagenUrl = '';
    this.formDisponible = true;
    this.imagePreview.set('');
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEditModal(marco: Marco) {
    this.isEditing.set(true);
    this.currentId = marco.id;
    this.formNombre = marco.nombre;
    this.formCategoriaId = marco.categoriaId;
    this.formDimensiones = marco.dimensiones;
    this.formTipoMadera = marco.tipoMadera;
    this.formPrecio = Number(marco.precio);
    this.formPrecioCarton =
      marco.precioCarton !== undefined && marco.precioCarton !== null
        ? Number(marco.precioCarton)
        : 0;
    this.formImagenUrl = marco.imagenUrl;
    this.formDisponible = marco.disponible;
    this.imagePreview.set(marco.imagenUrl);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadingImage.set(true);

      this.marcosService.uploadImage(file).subscribe({
        next: (res) => {
          this.uploadingImage.set(false);
          this.formImagenUrl = res.url;
          this.imagePreview.set(res.url);
        },
        error: (err) => {
          this.uploadingImage.set(false);
          alert(err.error?.message || 'Error al subir la imagen');
        },
      });
    }
  }

  toggleDisponible(marco: Marco) {
    this.marcosService.toggleDisponible(marco.id).subscribe({
      next: (updated) => {
        this.marcos.update((list) =>
          list.map((m) => (m.id === updated.id ? updated : m)),
        );
        this.showFlash(
          `Marco "${marco.nombre}" marcado como ${updated.disponible ? 'disponible' : 'no disponible'}`,
        );
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar estado');
      },
    });
  }

  saveMarco() {
    if (!this.formNombre.trim()) {
      this.errorMessage.set('El nombre del marco es obligatorio');
      return;
    }
    if (!this.formCategoriaId) {
      this.errorMessage.set('Debe seleccionar una categoría');
      return;
    }
    if (!this.formDimensiones.trim()) {
      this.errorMessage.set('Las dimensiones son obligatorias');
      return;
    }
    if (!this.formTipoMadera.trim()) {
      this.errorMessage.set('El tipo de madera es obligatorio');
      return;
    }
    if (this.formPrecio < 0) {
      this.errorMessage.set('El precio debe ser un valor positivo');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const payload = {
      nombre: this.formNombre,
      categoriaId: this.formCategoriaId,
      dimensiones: this.formDimensiones,
      tipoMadera: this.formTipoMadera,
      precio: Number(this.formPrecio),
      precioCarton: Number(this.formPrecioCarton) || 0,
      imagenUrl: this.formImagenUrl || '',
      disponible: this.formDisponible,
    };

    if (this.isEditing() && this.currentId) {
      this.marcosService.update(this.currentId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFlash('Marco actualizado con éxito');
          this.loadMarcos();
          this.loadWoodTypes();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Error al actualizar el marco');
        },
      });
    } else {
      this.marcosService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFlash('Marco registrado con éxito');
          this.loadMarcos();
          this.loadWoodTypes();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Error al crear el marco');
        },
      });
    }
  }

  deleteMarco(marco: Marco) {
    if (confirm(`¿Está seguro de eliminar el marco "${marco.nombre}"?`)) {
      this.marcosService.delete(marco.id).subscribe({
        next: () => {
          this.showFlash('Marco eliminado con éxito');
          this.loadMarcos();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al eliminar el marco');
        },
      });
    }
  }

  showFlash(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
