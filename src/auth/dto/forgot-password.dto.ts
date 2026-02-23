import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@ipe.edu.pe' })
  @IsEmail()
  email!: string;
}
