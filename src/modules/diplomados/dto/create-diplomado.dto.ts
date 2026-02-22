import { IsString, IsEnum, IsOptional, MaxLength, IsInt, IsNumber, Min, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const Modality = {
  PRESENCIAL: 'PRESENCIAL',
  VIRTUAL: 'VIRTUAL',
  HIBRIDO: 'HIBRIDO',
} as const;

const DiplomadoStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

type ModalityValue = (typeof Modality)[keyof typeof Modality];
type DiplomadoStatusValue = (typeof DiplomadoStatus)[keyof typeof DiplomadoStatus];

export class CreateDiplomadoDto {
  @ApiProperty({ example: 'Diplomado en Psicología Clínica' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Programa de formación especializada en psicología clínica...' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Teacher/coordinator UUID' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ enum: DiplomadoStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(DiplomadoStatus)
  status?: DiplomadoStatusValue;

  @ApiProperty({ enum: Modality, example: 'VIRTUAL' })
  @IsEnum(Modality)
  modality!: ModalityValue;

  @ApiPropertyOptional({ example: '2025-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-09-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 120, description: 'Duration in hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationHours?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'PEN' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'https://example.com/diplomado-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
