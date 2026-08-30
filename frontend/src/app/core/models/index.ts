export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  marcos?: Marco[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Marco {
  id: string;
  nombre: string;
  categoriaId: string;
  categoria?: Categoria;
  dimensiones: string;
  tipoMadera: string;
  precio: number;
  precioCarton?: number;
  imagenUrl: string;
  disponible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterMarco {
  search?: string;
  categoriaId?: string;
  categoriaSlug?: string;
  tipoMadera?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  sortBy?: string;
}

export interface CatalogoResponse {
  total: number;
  marcos: Marco[];
  categorias: Categoria[];
  woodTypes: string[];
}

export interface Usuario {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Usuario;
}
