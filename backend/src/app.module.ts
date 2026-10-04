import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { FamiliesModule } from './families/families.module';
import { FamilyPaymentsModule } from './family-payments/family-payments.module';
import { FinanceModule } from './finance/finance.module';
import { SacramentsModule } from './sacraments/sacraments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { PropertiesModule } from './properties/properties.module';
import { InventoryModule } from './inventory/inventory.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MembersModule,
    FamiliesModule,
    FamilyPaymentsModule,
    FinanceModule,
    SacramentsModule,
    CertificatesModule,
    PropertiesModule,
    InventoryModule,
    EmployeesModule,
  ],
})
export class AppModule {}
