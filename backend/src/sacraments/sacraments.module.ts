import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SacramentsController } from './sacraments.controller';
import { SacramentsService } from './sacraments.service';

@Module({
  imports: [PrismaModule],
  controllers: [SacramentsController],
  providers: [SacramentsService],
  exports: [SacramentsService],
})
export class SacramentsModule {}
