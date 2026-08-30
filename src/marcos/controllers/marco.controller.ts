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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MarcoService } from '../services/marco.service';
import { R2StorageService } from '../services/r2-storage.service';
import { CreateMarcoDto } from '../dto/create-marco.dto';
import { UpdateMarcoDto } from '../dto/update-marco.dto';
import { FilterMarcoDto } from '../dto/filter-marco.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/marcos')
export class MarcoController {
  constructor(
    private readonly marcoService: MarcoService,
    private readonly r2StorageService: R2StorageService,
  ) {}

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
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }
    const result = await this.r2StorageService.uploadImage(file);
    return {
      url: result.url,
      key: result.key,
    };
  }
}
