import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health & Telemetry')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'API & Database Health Check' })
  @ApiResponse({ status: 200, description: 'Service is operational' })
  async check() {
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'degraded';
    }

    return {
      status: 'ok',
      service: 'birhane-genet-erp-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    };
  }
}
