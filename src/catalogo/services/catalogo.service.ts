import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
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

    // Group marcos by category
    const categoryMap = new Map<string, { name: string; description?: string; marcos: Marco[] }>();

    for (const m of marcos) {
      const catName = m.categoria?.nombre || 'Colección General';
      const catDesc = m.categoria?.descripcion || '';
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { name: catName, description: catDesc, marcos: [] });
      }
      categoryMap.get(catName)!.marcos.push(m);
    }

    const sectionsHtml = Array.from(categoryMap.values())
      .map(
        (group) => `
      <section class="category-section">
        <div class="category-section-header">
          <div class="cat-title-wrap">
            <span class="cat-icon">📁</span>
            <h2>${group.name}</h2>
          </div>
          <span class="cat-badge">${group.marcos.length} ${group.marcos.length === 1 ? 'modelo' : 'modelos'}</span>
        </div>
        ${group.description ? `<p class="category-section-desc">${group.description}</p>` : ''}
        <div class="grid">
          ${group.marcos
            .map(
              (m) => `
            <div class="card ${m.disponible ? '' : 'unavailable'}">
              <div class="image-wrapper">
                ${
                  m.imagenUrl
                    ? `<img src="${m.imagenUrl}" alt="${m.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                       <div class="placeholder-img" style="display:none;">🖼️ Marco de Madera</div>`
                    : `<div class="placeholder-img">🖼️ Marco de Madera</div>`
                }
                <span class="badge ${m.disponible ? 'badge-success' : 'badge-danger'}">
                  ${m.disponible ? 'Disponible' : 'Agotado'}
                </span>
              </div>
              <div class="card-body">
                <div class="category-tag">${m.categoria?.nombre || 'General'}</div>
                <h3 class="card-title">${m.nombre}</h3>
                <div class="specs">
                  <div class="spec-row">
                    <span class="spec-label">Madera:</span>
                    <span class="wood-chip">${m.tipoMadera}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Dimensiones:</span>
                    <span class="spec-val">${m.dimensiones}</span>
                  </div>
                </div>
                ${
                  Number(m.precioCarton) > 0
                    ? `<div class="carton-badge">📦 Con fondo de cartón: +Bs. ${Number(m.precioCarton).toFixed(2)}</div>`
                    : ''
                }
                <div class="price-row">
                  <span class="price-currency">Bs.</span>
                  <span class="price-value">${Number(m.precio).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </section>
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
      line-height: 1.5;
      padding: 24px 16px;
    }
    .container {
      max-width: 1300px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #5C2C0B 0%, #8B4513 100%);
      color: #FFF8EE;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 4px 15px rgba(92, 44, 11, 0.15);
    }
    header h1 {
      font-size: 1.4rem;
      margin-bottom: 3px;
      font-weight: 700;
    }
    header p {
      font-size: 0.85rem;
      opacity: 0.92;
      max-width: 600px;
      margin: 0 auto;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      padding: 8px 16px;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 0.82rem;
      color: var(--muted);
    }
    .category-section {
      margin-bottom: 36px;
    }
    .category-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      margin-bottom: 14px;
    }
    .cat-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-title-wrap h2 {
      font-size: 1.15rem;
      color: var(--primary-dark);
      font-weight: 700;
    }
    .cat-badge {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--primary);
      background: var(--bg);
      padding: 3px 8px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .category-section-desc {
      font-size: 0.84rem;
      color: var(--muted);
      margin: -6px 0 16px 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 20px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
    .image-wrapper {
      position: relative;
      width: 100%;
      height: 220px;
      background: #FAF7F2;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--border);
    }
    .image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #FAF7F2;
    }
    .placeholder-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      color: var(--muted);
      font-weight: 600;
    }
    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
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
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .category-tag {
      font-size: 0.72rem;
      color: var(--accent);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .card-title {
      font-size: 1.15rem;
      color: var(--primary-dark);
      margin-bottom: 10px;
      font-weight: 700;
      line-height: 1.25;
    }
    .specs {
      font-size: 0.84rem;
      color: var(--muted);
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-grow: 1;
    }
    .spec-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .spec-label {
      color: var(--muted);
    }
    .wood-chip {
      background: #FAF7F2;
      color: var(--primary-dark);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      border: 1px solid var(--border);
    }
    .carton-badge {
      font-size: 0.76rem;
      color: var(--primary-dark);
      background: #FEF3C7;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 10px;
      display: block;
      font-weight: 600;
      border: 1px dashed #D97706;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      margin-top: auto;
    }
    .price-currency {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--primary);
    }
    .price-value {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--primary);
    }
    @media (max-width: 520px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .image-wrapper {
        height: 160px;
      }
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

    ${sectionsHtml}

    <footer>
      <p>© ${new Date().getFullYear()} Taller de Marcos de Madera. Todos los derechos reservados.</p>
      <p>Calidad artesanal y diseños personalizados.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  private async fetchImageBuffer(url?: string): Promise<Buffer | null> {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();
    if (!cleanUrl) return null;
    try {
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        const res = await fetch(cleanUrl, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      } else if (cleanUrl.startsWith('/uploads/')) {
        const localPath = join(process.cwd(), cleanUrl);
        if (existsSync(localPath)) {
          return readFileSync(localPath);
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  async generatePdfCatalog(filter?: FilterMarcoDto): Promise<Buffer> {
    const marcos = await this.marcoRepo.findAll(filter);

    // Pre-fetch image buffers in parallel
    const items = await Promise.all(
      marcos.map(async (m) => ({
        marco: m,
        imageBuffer: await this.fetchImageBuffer(m.imagenUrl),
      })),
    );

    // Group items by category
    const categoryGroups = new Map<string, { categoryName: string; items: { marco: Marco; imageBuffer: Buffer | null }[] }>();

    for (const item of items) {
      const catName = item.marco.categoria?.nombre || 'Colección General';
      if (!categoryGroups.has(catName)) {
        categoryGroups.set(catName, { categoryName: catName, items: [] });
      }
      categoryGroups.get(catName)!.items.push(item);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape', bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: any) => reject(err));

      // Header Banner
      doc.rect(0, 0, doc.page.width, 68).fill('#5C2C0B');
      doc.fillColor('#FFF8EE').fontSize(17).font('Helvetica-Bold')
        .text('TALLER DE MARCOS DE MADERA', 30, 16, { align: 'center' });
      doc.fillColor('#D27D2D').fontSize(8.5).font('Helvetica')
        .text('Catálogo exclusivo de molduras y marcos finos fabricados a medida en maderas selectas', 30, 40, { align: 'center' });

      // Metadata Bar
      const startY = 76;
      doc.roundedRect(30, startY, doc.page.width - 60, 20, 4).fillAndStroke('#FFFFFF', '#E8DFD8');
      doc.fillColor('#6B5E55').fontSize(8).font('Helvetica')
        .text(`Total de productos: ${items.length} marcos disponibles`, 42, startY + 5.5);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 540, startY + 5.5, { width: 260, align: 'right' });

      let currentY = startY + 28;

      for (const group of categoryGroups.values()) {
        // Section Header check (needs header + 1 row of cards = 30 + 205 = 235pt)
        if (currentY + 235 > doc.page.height - 30) {
          doc.addPage();
          currentY = 30;
        }

        // Category Section Header Ribbon (Landscape width)
        const ribbonW = doc.page.width - 60;
        doc.roundedRect(30, currentY, ribbonW, 24, 5).fillAndStroke('#FFFFFF', '#E8DFD8');
        doc.rect(30, currentY, 4, 24).fill('#D27D2D');
        doc.fillColor('#5C2C0B').fontSize(10.5).font('Helvetica-Bold')
          .text(group.categoryName.toUpperCase(), 44, currentY + 6.5);

        // Count Badge
        doc.roundedRect(30 + ribbonW - 75, currentY + 4, 68, 16, 8).fillAndStroke('#FAF6F0', '#E8DFD8');
        doc.fillColor('#8B4513').fontSize(7.5).font('Helvetica-Bold')
          .text(`${group.items.length} ${group.items.length === 1 ? 'modelo' : 'modelos'}`, 30 + ribbonW - 75, currentY + 7.5, { width: 68, align: 'center' });

        currentY += 30;

        // Process cards in groups of 3 (3 columns per row in Landscape)
        for (let i = 0; i < group.items.length; i += 3) {
          const rowItems = group.items.slice(i, i + 3);

          // Page break check for a row of cards (205pt height)
          if (currentY + 205 > doc.page.height - 30) {
            doc.addPage();
            currentY = 30;
          }

          rowItems.forEach(({ marco, imageBuffer }, colIndex) => {
            const cardW = 248;
            const cardH = 200;
            const gap = 18.5;
            const cardX = 30 + colIndex * (cardW + gap);

            // Card container
            doc.roundedRect(cardX, currentY, cardW, cardH, 7)
              .fillAndStroke('#FFFFFF', '#E8DFD8');

            // Image container
            const imgX = cardX + 7;
            const imgY = currentY + 7;
            const imgW = cardW - 14;
            const imgH = 102;
            doc.roundedRect(imgX, imgY, imgW, imgH, 5).fillAndStroke('#FAF7F2', '#E8DFD8');

            if (imageBuffer) {
              try {
                doc.image(imageBuffer, imgX + 3, imgY + 3, {
                  fit: [imgW - 6, imgH - 6],
                  align: 'center',
                  valign: 'center',
                });
              } catch {
                doc.fillColor('#A89B8C').fontSize(8.5).font('Helvetica')
                  .text('Marco de Madera', imgX, imgY + 44, { width: imgW, align: 'center' });
              }
            } else {
              doc.fillColor('#A89B8C').fontSize(8.5).font('Helvetica')
                .text('Marco de Madera', imgX, imgY + 44, { width: imgW, align: 'center' });
            }

            // Status Badge top-right of image
            const badgeW = 56;
            const badgeH = 12;
            const badgeX = imgX + imgW - badgeW - 5;
            const badgeY = imgY + 5;
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 6)
              .fill(marco.disponible ? '#2E7D32' : '#C62828');
            doc.fillColor('#FFFFFF').fontSize(6).font('Helvetica-Bold')
              .text(marco.disponible ? 'DISPONIBLE' : 'AGOTADO', badgeX, badgeY + 2.5, { width: badgeW, align: 'center' });

            // Category tag
            doc.fillColor('#D27D2D').fontSize(6.8).font('Helvetica-Bold')
              .text((marco.categoria?.nombre || 'GENERAL').toUpperCase(), cardX + 10, currentY + 114);

            // Title
            doc.fillColor('#5C2C0B').fontSize(10).font('Helvetica-Bold')
              .text(marco.nombre, cardX + 10, currentY + 124, { width: cardW - 20, ellipsis: true });

            // Madera row
            doc.fillColor('#6B5E55').fontSize(7.5).font('Helvetica')
              .text('Madera:', cardX + 10, currentY + 139);
            doc.roundedRect(cardX + cardW - 58, currentY + 136, 48, 13, 3)
              .fillAndStroke('#FAF7F2', '#E8DFD8');
            doc.fillColor('#2C221E').fontSize(7).font('Helvetica-Bold')
              .text(marco.tipoMadera, cardX + cardW - 58, currentY + 138, { width: 48, align: 'center' });

            // Dimensiones row
            doc.fillColor('#6B5E55').fontSize(7.5).font('Helvetica')
              .text('Dimensiones:', cardX + 10, currentY + 153);
            doc.fillColor('#2C221E').fontSize(7.5).font('Helvetica-Bold')
              .text(marco.dimensiones, cardX + 80, currentY + 153, { width: cardW - 90, align: 'right' });

            // Carton extra (if configured)
            if (Number(marco.precioCarton) > 0) {
              doc.roundedRect(cardX + 10, currentY + 166, cardW - 20, 12, 3).fill('#FEF3C7');
              doc.fillColor('#78350F').fontSize(6.5).font('Helvetica-Bold')
                .text(`Con fondo de cartón: +Bs. ${Number(marco.precioCarton).toFixed(2)}`, cardX + 13, currentY + 168);
            }

            // Separator line & Price
            doc.moveTo(cardX + 10, currentY + 180).lineTo(cardX + cardW - 10, currentY + 180)
              .strokeColor('#E8DFD8').lineWidth(0.8).stroke();
            doc.fillColor('#8B4513').fontSize(8.5).font('Helvetica-Bold')
              .text('Bs.', cardX + 10, currentY + 185);
            doc.fillColor('#8B4513').fontSize(13).font('Helvetica-Bold')
              .text(Number(marco.precio).toFixed(2), cardX + 26, currentY + 183);
          });

          currentY += 208;
        }

        currentY += 12; // Spacing after category
      }

      // Footer numbering across all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7.5).fillColor('#888888').text(
          `Página ${i + 1} de ${range.count} - Taller de Marcos de Madera`,
          30,
          doc.page.height - 20,
          { align: 'center', width: doc.page.width - 60 },
        );
      }

      doc.end();
    });
  }
}
