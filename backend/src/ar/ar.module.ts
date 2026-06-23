import { Module } from '@nestjs/common';
import { ARController } from './ar.controller';
import { ARService } from './ar.service';

@Module({
  controllers: [ARController],
  providers: [ARService],
})
export class ARModule {}
