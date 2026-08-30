import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { CatalogoService } from '../services/catalogo.service';
import { FilterMarcoDto } from '../../marcos/dto/filter-marco.dto';

@Controller('api/catalogo')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  getCatalogo(@Query() filter: FilterMarcoDto) {
    return this.catalogoService.getCatalogo(filter);
  }

  @Get('html')
  async exportHtml(@Query() filter: FilterMarcoDto, @Res() res: Response) {
    const html = await this.catalogoService.generateHtmlCatalog(filter);
    const filename = await this.catalogoService.getExportFilename(filter, 'html');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(html);
  }

  @Get('html-view')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async viewHtml(@Query() filter: FilterMarcoDto) {
    return this.catalogoService.generateHtmlCatalog(filter);
  }

  @Get('pdf')
  async exportPdf(@Query() filter: FilterMarcoDto, @Res() res: Response) {
    const pdfBuffer = await this.catalogoService.generatePdfCatalog(filter);
    const filename = await this.catalogoService.getExportFilename(filter, 'pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.end(pdfBuffer);
  }
}
