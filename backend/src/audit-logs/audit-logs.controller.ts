import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter immutable audit log entries (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  async list(@Query() query: QueryAuditLogDto) {
    return this.auditLogsService.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve audit trail metrics and security event summary' })
  @ApiResponse({ status: 200, description: 'Audit trail statistics' })
  async stats() {
    const stats = await this.auditLogsService.stats();
    return { data: stats };
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Retrieve unique users, actions, and entities for UI filters' })
  @ApiResponse({ status: 200, description: 'Filter dropdown options' })
  async filterOptions() {
    const options = await this.auditLogsService.filterOptions();
    return { data: options };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single audit log entry by ID' })
  @ApiParam({ name: 'id', description: 'Audit Log CUID' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getById(@Param('id') id: string) {
    const log = await this.auditLogsService.getById(id);
    return { data: log };
  }
}
