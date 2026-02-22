import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';

export class QueryStudentDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by status (ACTIVE, INACTIVE, SUSPENDED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by name, email or document number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;
}
