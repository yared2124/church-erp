import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChurchHistoryController } from './church-history.controller';
import { ChurchHistoryService } from './church-history.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChurchHistoryController],
  providers: [ChurchHistoryService],
  exports: [ChurchHistoryService],
})
export class ChurchHistoryModule {}
