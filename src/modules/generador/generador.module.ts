import { Module } from '@nestjs/common';
import { GeneradorController } from './generador.controller';
import { GeneradorService } from './generador.service';
import { AnthropicService } from './anthropic.service';

@Module({
  controllers: [GeneradorController],
  providers: [GeneradorService, AnthropicService],
  exports: [GeneradorService],
})
export class GeneradorModule {}
