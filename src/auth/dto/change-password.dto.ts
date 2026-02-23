import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual', example: 'CurrentP@ss123' })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña', example: 'NewSecureP@ss456', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;

  @ApiProperty({ description: 'Confirmar nueva contraseña', example: 'NewSecureP@ss456' })
  @IsString()
  @MinLength(8)
  confirmNewPassword!: string;
}
