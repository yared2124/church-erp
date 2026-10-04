import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChurchHistoryService } from './church-history.service';
import { CreateHistoryEntryDto } from './dto/create-history-entry.dto';
import { UpdateHistoryEntryDto } from './dto/update-history-entry.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { CreateHistoryDocumentDto } from './dto/create-history-document.dto';

@ApiTags('Church History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('church-history')
export class ChurchHistoryController {
  constructor(private readonly historyService: ChurchHistoryService) {}

  // ==========================================
  // Timeline Endpoints
  // ==========================================

  @Get('timeline')
  @ApiOperation({ summary: 'Get church history timeline with optional type, year, and search filters' })
  @ApiResponse({ status: 200, description: 'Chronological timeline entries' })
  async timeline(@Query() query: QueryHistoryDto) {
    const entries = await this.historyService.timeline(query);
    return { data: entries };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve historical milestones, events, and decade distribution' })
  @ApiResponse({ status: 200, description: 'History analytics summary' })
  async stats() {
    const stats = await this.historyService.stats();
    return { data: stats };
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get single history entry by ID' })
  @ApiParam({ name: 'id', description: 'History Entry CUID' })
  @ApiResponse({ status: 200, description: 'History entry record' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async getEntryById(@Param('id') id: string) {
    const entry = await this.historyService.getEntryById(id);
    return { data: entry };
  }

  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Priest')
  @ApiOperation({ summary: 'Add a new historical entry or milestone' })
  @ApiResponse({ status: 201, description: 'History entry created' })
  async createEntry(
    @Body() dto: CreateHistoryEntryDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const entry = await this.historyService.createEntry(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: entry };
  }

  @Patch('entries/:id')
  @Roles('Super Admin', 'Priest')
  @ApiOperation({ summary: 'Update a history entry or milestone' })
  @ApiParam({ name: 'id', description: 'History Entry CUID' })
  @ApiResponse({ status: 200, description: 'History entry updated' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateHistoryEntryDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.historyService.updateEntry(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete('entries/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete a history entry' })
  @ApiParam({ name: 'id', description: 'History Entry CUID' })
  @ApiResponse({ status: 200, description: 'History entry deleted' })
  async deleteEntry(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.historyService.deleteEntry(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }

  // ==========================================
  // Historical Documents Endpoints
  // ==========================================

  @Get('documents')
  @ApiOperation({ summary: 'List archived historical documents' })
  @ApiResponse({ status: 200, description: 'List of archived documents' })
  async listDocuments(@Query('limit') limit?: number) {
    const documents = await this.historyService.listDocuments(limit ? Number(limit) : undefined);
    return { data: documents };
  }

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Priest')
  @ApiOperation({ summary: 'Register an archived historical document' })
  @ApiResponse({ status: 201, description: 'Document archived' })
  async createDocument(
    @Body() dto: CreateHistoryDocumentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const doc = await this.historyService.createDocument(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: doc };
  }

  @Delete('documents/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete an archived historical document' })
  @ApiParam({ name: 'id', description: 'Document CUID' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.historyService.deleteDocument(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }
}
