import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPlus,
  heroPencilSquare,
  heroTrash,
  heroFolder,
  heroXMark,
  heroCheckCircle,
  heroExclamationTriangle,
} from '@ng-icons/heroicons/outline';
import { CategoriasService } from '../../../core/services/categorias.service';
import { Categoria } from '../../../core/models';

@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [
    provideIcons({
      heroPlus,
      heroPencilSquare,
      heroTrash,
      heroFolder,
      heroXMark,
      heroCheckCircle,
      heroExclamationTriangle,
    }),
  ],
  templateUrl: './categorias-admin.component.html',
  styleUrl: './categorias-admin.component.scss',
})
export class CategoriasAdminComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modal State
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentId: string | null = null;

  // Form fields
  formNombre = '';
  formSlug = '';
  formDescripcion = '';

  constructor(private categoriasService: CategoriasService) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.loading.set(true);
    this.categoriasService.getAll().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al cargar categorías');
      },
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentId = null;
    this.formNombre = '';
    this.formSlug = '';
    this.formDescripcion = '';
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEditModal(cat: Categoria) {
    this.isEditing.set(true);
    this.currentId = cat.id;
    this.formNombre = cat.nombre;
    this.formSlug = cat.slug;
    this.formDescripcion = cat.descripcion || '';
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onNombreChange() {
    if (!this.isEditing()) {
      this.formSlug = this.formNombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  saveCategoria() {
    if (!this.formNombre.trim()) {
      this.errorMessage.set('El nombre de la categoría es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const payload = {
      nombre: this.formNombre,
      slug: this.formSlug || undefined,
      descripcion: this.formDescripcion || undefined,
    };

    if (this.isEditing() && this.currentId) {
      this.categoriasService.update(this.currentId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFlash('Categoría actualizada con éxito');
          this.loadCategorias();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Error al actualizar la categoría');
        },
      });
    } else {
      this.categoriasService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.showFlash('Categoría creada con éxito');
          this.loadCategorias();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.error?.message || 'Error al crear la categoría');
        },
      });
    }
  }

  deleteCategoria(cat: Categoria) {
    if (confirm(`¿Está seguro de eliminar la categoría "${cat.nombre}"?`)) {
      this.categoriasService.delete(cat.id).subscribe({
        next: () => {
          this.showFlash('Categoría eliminada con éxito');
          this.loadCategorias();
        },
        error: (err) => {
          alert(err.error?.message || 'No se puede eliminar la categoría porque tiene marcos asociados.');
        },
      });
    }
  }

  showFlash(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
