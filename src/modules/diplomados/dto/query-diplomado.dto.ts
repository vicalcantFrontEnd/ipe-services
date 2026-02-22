import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDiplomadoDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status (DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, ARCHIVED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by modality (PRESENCIAL, VIRTUAL, HIBRIDO)' })
  @IsOptional()
  @IsString()
  modality?: string;

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
