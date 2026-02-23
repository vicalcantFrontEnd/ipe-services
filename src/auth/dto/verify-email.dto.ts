import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de verificación recibido por email' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
