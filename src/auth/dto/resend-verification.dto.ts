import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@ipe.edu.pe' })
  @IsEmail()
  email!: string;
}
