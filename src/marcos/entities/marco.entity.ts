import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity('marcos')
export class Marco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 180 })
  nombre: string;

  @Column({ type: 'uuid' })
  categoriaId: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.marcos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @Column({ type: 'varchar', length: 100 })
  dimensiones: string;

  @Column({ type: 'varchar', length: 100 })
  tipoMadera: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  precioCarton: number;

  @Column({ type: 'text', nullable: true })
  imagenUrl: string;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
