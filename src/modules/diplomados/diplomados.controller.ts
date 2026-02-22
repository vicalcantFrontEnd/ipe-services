import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { DiplomadosService } from './diplomados.service';
import { CreateDiplomadoDto, UpdateDiplomadoDto, QueryDiplomadoDto } from './dto';
import { Roles, Public } from '../../common/decorators';

@ApiTags('diplomados')
@ApiBearerAuth('access-token')
@Controller('diplomados')
export class DiplomadosController {
  constructor(private readonly service: DiplomadosService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiCreatedResponse({ description: 'Diplomado created' })
  async create(@Body() dto: CreateDiplomadoDto) {
    return this.service.create(dto);
  }

  @Get()
  @Public()
  @ApiOkResponse({ description: 'Paginated list of diplomados' })
  async findAll(@Query() query: QueryDiplomadoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ description: 'Diplomado found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOkResponse({ description: 'Diplomado found by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOkResponse({ description: 'Diplomado updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDiplomadoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Diplomado deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
