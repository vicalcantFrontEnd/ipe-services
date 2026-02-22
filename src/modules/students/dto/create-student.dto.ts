import { IsString, IsEmail, IsEnum, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const DocumentType = {
  DNI: 'DNI',
  CE: 'CE',
  PASSPORT: 'PASSPORT',
} as const;

const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
} as const;

type DocumentTypeValue = (typeof DocumentType)[keyof typeof DocumentType];
type GenderValue = (typeof Gender)[keyof typeof Gender];

export class CreateStudentDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'García López' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'maria.garcia@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+51987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ enum: DocumentType, example: 'DNI' })
  @IsEnum(DocumentType)
  documentType!: DocumentTypeValue;

  @ApiProperty({ example: '72345678' })
  @IsString()
  @MaxLength(20)
  documentNumber!: string;

  @ApiPropertyOptional({ example: '1995-03-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: GenderValue;

  @ApiPropertyOptional({ example: 'Av. La Marina 1234, Lima' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Lima' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}
