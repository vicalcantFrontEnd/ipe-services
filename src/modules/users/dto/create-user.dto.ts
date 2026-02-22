import { IsString, IsEmail, IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PSYCHOLOGIST: 'PSYCHOLOGIST',
  TEACHER: 'TEACHER',
  SECRETARY: 'SECRETARY',
} as const;

type AdminUserRole = (typeof UserRole)[keyof typeof UserRole];

export class CreateUserDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'juan.perez@ipe.edu.pe' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ example: '+51987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ enum: UserRole, example: 'ADMIN' })
  @IsEnum(UserRole)
  role!: AdminUserRole;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
