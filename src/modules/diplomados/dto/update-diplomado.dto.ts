import { PartialType } from '@nestjs/swagger';
import { CreateDiplomadoDto } from './create-diplomado.dto';

export class UpdateDiplomadoDto extends PartialType(CreateDiplomadoDto) {}
