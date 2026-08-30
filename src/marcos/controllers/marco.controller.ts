import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MarcoService } from '../services/marco.service';
import { CreateMarcoDto } from '../dto/create-marco.dto';
import { UpdateMarcoDto } from '../dto/update-marco.dto';
import { FilterMarcoDto } from '../dto/filter-marco.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/marcos')
export class MarcoController {
  constructor(private readonly marcoService: MarcoService) {}

  @Get()
  findAll(@Query() filter: FilterMarcoDto) {
    return this.marcoService.findAll(filter);
  }

  @Get('wood-types')
  getWoodTypes() {
    return this.marcoService.getWoodTypes();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcoService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateMarcoDto) {
    return this.marcoService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMarcoDto,
  ) {
    return this.marcoService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-disponible')
  toggleDisponible(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcoService.toggleDisponible(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.marcoService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `marco-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
