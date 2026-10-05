import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateImportJobDto } from './dto/create-import-job.dto';

@ApiTags('Reports & Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Retrieve report generation statistics and category breakdown' })
  @ApiResponse({ status: 200, description: 'Reports analytics overview' })
  async overview() {
    const data = await this.reportsService.overview();
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List recent generated reports' })
  @ApiResponse({ status: 200, description: 'List of reports' })
  async listReports(@Query('limit') limit?: number) {
    const reports = await this.reportsService.listReports(limit ? Number(limit) : undefined);
    return { data: reports };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Generate and record an export report' })
  @ApiResponse({ status: 201, description: 'Report recorded' })
  async createReport(
    @Body() dto: CreateReportDto,
    @CurrentUser('id') actorId: string,
  ) {
    const report = await this.reportsService.createReport(dto, actorId);
    return { data: report };
  }

  @Get('import-jobs')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'List data migration and bulk import jobs (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'List of import jobs' })
  async listImportJobs(@Query('limit') limit?: number) {
    const jobs = await this.reportsService.listImportJobs(limit ? Number(limit) : undefined);
    return { data: jobs };
  }

  @Post('import-jobs')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Record a data migration or bulk import job' })
  @ApiResponse({ status: 201, description: 'Import job created' })
  async createImportJob(
    @Body() dto: CreateImportJobDto,
    @CurrentUser('id') actorId: string,
  ) {
    const job = await this.reportsService.createImportJob(dto, actorId);
    return { data: job };
  }
}
