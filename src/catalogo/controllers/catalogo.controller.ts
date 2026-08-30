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
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="catalogo-marcos-madera.html"')
  async exportHtml(@Query() filter: FilterMarcoDto) {
    return this.catalogoService.generateHtmlCatalog(filter);
  }

  @Get('html-view')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async viewHtml(@Query() filter: FilterMarcoDto) {
    return this.catalogoService.generateHtmlCatalog(filter);
  }

  @Get('pdf')
  async exportPdf(@Query() filter: FilterMarcoDto, @Res() res: Response) {
    const pdfBuffer = await this.catalogoService.generatePdfCatalog(filter);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="catalogo-marcos-madera.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.end(pdfBuffer);
  }
}
