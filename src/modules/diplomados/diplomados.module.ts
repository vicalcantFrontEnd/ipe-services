import { Module } from '@nestjs/common';
import { DiplomadosController } from './diplomados.controller';
import { DiplomadosService } from './diplomados.service';
import { DiplomadosRepository } from './diplomados.repository';

@Module({
  controllers: [DiplomadosController],
  providers: [DiplomadosService, DiplomadosRepository],
  exports: [DiplomadosService],
})
export class DiplomadosModule {}
