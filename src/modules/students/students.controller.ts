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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from './dto';
import { Roles } from '../../common/decorators';

@ApiTags('students')
@ApiBearerAuth('access-token')
@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SECRETARY')
  @ApiCreatedResponse({ description: 'Student created' })
  async create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated list of students' })
  async findAll(@Query() query: QueryStudentDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Student found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SECRETARY')
  @ApiOkResponse({ description: 'Student updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Student deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
