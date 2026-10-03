import { Module } from '@nestjs/common';
import { FamilyPaymentsService } from './family-payments.service';
import { FamilyPaymentsController } from './family-payments.controller';

@Module({
  controllers: [FamilyPaymentsController],
  providers: [FamilyPaymentsService],
  exports: [FamilyPaymentsService],
})
export class FamilyPaymentsModule {}
