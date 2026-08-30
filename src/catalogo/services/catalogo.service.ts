import { Injectable } from '@nestjs/common';
import { MarcoRepository } from '../../marcos/repositories/marco.repository';
import { CategoriaRepository } from '../../categorias/repositories/categoria.repository';
import { FilterMarcoDto } from '../../marcos/dto/filter-marco.dto';
import { Marco } from '../../marcos/entities/marco.entity';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class CatalogoService {
  constructor(
    private readonly marcoRepo: MarcoRepository,
    private readonly categoriaRepo: CategoriaRepository,
  ) {}

  async getCatalogo(filter?: FilterMarcoDto) {
    const marcos = await this.marcoRepo.findAll(filter);
    const categorias = await this.categoriaRepo.findAll();
    const woodTypes = await this.marcoRepo.getWoodTypes();

    return {
      total: marcos.length,
      marcos,
      categorias,
      woodTypes,
    };
  }

  async generateHtmlCatalog(filter?: FilterMarcoDto): Promise<string> {
    const marcos = await this.marcoRepo.findAll(filter);
    const generationDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsHtml = marcos
      .map(
        (m) => `
      <div class="card ${m.disponible ? '' : 'unavailable'}">
          ${
            m.imagenUrl
              ? `<img src="${m.imagenUrl}" alt="${m.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                 <div class="placeholder-img" style="display:none;">🖼️ Sin Imagen</div>`
              : `<div class="placeholder-img">🖼️ Marco Artesanal</div>`
          }
          <span class="badge ${m.disponible ? 'badge-success' : 'badge-danger'}">
            ${m.disponible ? 'Disponible' : 'Agotado'}
          </span>
        </div>
        <div class="card-body">
          <div class="category-tag">${m.categoria?.nombre || 'General'}</div>
          <h3 class="card-title">${m.nombre}</h3>
          <div class="specs">
            <p><strong>Tipo de Madera:</strong> <span>${m.tipoMadera}</span></p>
            <p><strong>Dimensiones:</strong> <span>${m.dimensiones}</span></p>
          </div>
          <div class="price-row">
            <span class="price-label">Precio Base:</span>
            <span class="price-value">Bs. ${Number(m.precio).toFixed(2)}</span>
          </div>
          ${
            Number(m.precioCarton) > 0
              ? `<div class="carton-badge">📦 Con soporte de cartón: +Bs. ${Number(m.precioCarton).toFixed(2)} (Total: Bs. ${(Number(m.precio) + Number(m.precioCarton)).toFixed(2)})</div>`
              : ''
          }
        </div>
      </div>
    `,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo de Marcos de Madera - Taller Artesanal</title>
  <style>
    :root {
      --primary: #8B4513;
      --primary-dark: #5C2C0B;
      --accent: #D27D2D;
      --bg: #FAF6F0;
      --text: #2C221E;
      --muted: #6B5E55;
      --card-bg: #FFFFFF;
      --border: #E8DFD8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #5C2C0B 0%, #8B4513 100%);
      color: #FFF8EE;
      border-radius: 16px;
      margin-bottom: 35px;
      box-shadow: 0 10px 25px rgba(92, 44, 11, 0.2);
    }
    header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    header p {
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 650px;
      margin: 0 auto;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding: 12px 20px;
      background: #FFFFFF;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-size: 0.95rem;
      color: var(--muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .image-wrapper {
      position: relative;
      width: 100%;
      height: 220px;
      background: #F3ECE6;
      overflow: hidden;
    }
    .image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--muted);
      font-weight: 600;
    }
    .badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success {
      background: #2E7D32;
      color: #FFFFFF;
    }
    .badge-danger {
      background: #C62828;
      color: #FFFFFF;
    }
    .card-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .category-tag {
      font-size: 0.8rem;
      color: var(--accent);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .card-title {
      font-size: 1.25rem;
      color: var(--primary-dark);
      margin-bottom: 12px;
      font-weight: 600;
    }
    .specs {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 15px;
      flex-grow: 1;
    }
    .specs p {
      margin-bottom: 4px;
    }
    .specs strong {
      color: var(--text);
    }
    .price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 15px;
      margin-top: auto;
    }
    .price-label {
      font-size: 0.9rem;
      color: var(--muted);
      font-weight: 500;
    }
    .price-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary);
    }
    .actions-bar {
      margin-bottom: 20px;
      text-align: right;
    }
    .btn-print {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .btn-print:hover {
      background: var(--primary-dark);
    }
    footer {
      text-align: center;
      margin-top: 50px;
      padding: 25px;
      color: var(--muted);
      font-size: 0.9rem;
      border-top: 1px solid var(--border);
    }
    @media print {
      .actions-bar { display: none; }
      body { background: white; padding: 0; }
      .card { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="actions-bar">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
    </div>
    <header>
      <h1>🌲 Taller de Marcos de Madera</h1>
      <p>Catálogo exclusivo de molduras y marcos finos fabricados a medida en maderas selectas</p>
    </header>

    <div class="meta-info">
      <div><strong>Total de productos:</strong> ${marcos.length} marcos disponibles</div>
      <div><strong>Fecha de emisión:</strong> ${generationDate}</div>
    </div>

    <div class="grid">
      ${itemsHtml}
    </div>

    <footer>
      <p>© ${new Date().getFullYear()} Taller de Marcos de Madera. Todos los derechos reservados.</p>
      <p>Calidad artesanal y diseños personalizados.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  async generatePdfCatalog(filter?: FilterMarcoDto): Promise<Buffer> {
    const marcos = await this.marcoRepo.findAll(filter);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: any) => reject(err));

      // Header
      doc.rect(0, 0, doc.page.width, 100).fill('#5C2C0B');
      doc.fillColor('#FAF6F0').fontSize(22).font('Helvetica-Bold')
        .text('TALLER DE MARCOS DE MADERA', 40, 30, { align: 'center' });
      doc.fontSize(11).font('Helvetica')
        .text('Catálogo Oficial de Productos y Marcos Artesanales', 40, 60, { align: 'center' });

      doc.moveDown(4);

      // Metadata box
      const startY = 120;
      doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold')
        .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 40, startY);
      doc.text(`Total de Marcos: ${marcos.length}`, 400, startY, { align: 'right' });

      doc.moveTo(40, startY + 18).lineTo(555, startY + 18).strokeColor('#D27D2D').lineWidth(1.5).stroke();

      let currentY = startY + 30;

      marcos.forEach((marco: Marco, index: number) => {
        // Page break check
        if (currentY + 110 > doc.page.height - 50) {
          doc.addPage();
          currentY = 40;
        }

        // Card container
        doc.roundedRect(40, currentY, 515, 95, 6)
          .fillAndStroke(index % 2 === 0 ? '#FAF6F0' : '#FFFFFF', '#E8DFD8');

        // Text & details
        doc.fillColor('#5C2C0B').fontSize(13).font('Helvetica-Bold')
          .text(marco.nombre, 55, currentY + 12);

        doc.fillColor('#D27D2D').fontSize(9).font('Helvetica-Bold')
          .text(`CATEGORÍA: ${marco.categoria?.nombre?.toUpperCase() || 'GENERAL'}`, 55, currentY + 30);

        doc.fillColor('#444444').fontSize(10).font('Helvetica')
          .text(`• Tipo de Madera: `, 55, currentY + 46, { continued: true })
          .font('Helvetica-Bold').text(marco.tipoMadera);

        doc.font('Helvetica')
          .text(`• Dimensiones: `, 55, currentY + 62, { continued: true })
          .font('Helvetica-Bold').text(marco.dimensiones);

        if (Number(marco.precioCarton) > 0) {
          doc.fillColor('#78350F').fontSize(9).font('Helvetica-Oblique')
            .text(`• Opción con cartón: +Bs. ${Number(marco.precioCarton).toFixed(2)}`, 55, currentY + 77);
        }

        // Price and Availability
        const statusText = marco.disponible ? 'DISPONIBLE' : 'AGOTADO';
        const statusColor = marco.disponible ? '#2E7D32' : '#C62828';

        doc.fillColor(statusColor).fontSize(9).font('Helvetica-Bold')
          .text(statusText, 380, currentY + 15, { align: 'right', width: 160 });

        doc.fillColor('#8B4513').fontSize(15).font('Helvetica-Bold')
          .text(`Bs. ${Number(marco.precio).toFixed(2)}`, 380, currentY + 45, { align: 'right', width: 160 });

        currentY += 105;
      });

      // Footer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#888888').text(
          `Página ${i + 1} de ${range.count} - Taller de Marcos de Madera`,
          40,
          doc.page.height - 30,
          { align: 'center' },
        );
      }

      doc.end();
    });
  }
}
