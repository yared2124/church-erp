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
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { QueryFamilyDto } from './dto/query-family.dto';

@ApiTags('Families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @ApiOperation({ summary: 'List and paginate families with search and status filters' })
  @ApiResponse({ status: 200, description: 'Paginated family list retrieved successfully' })
  async list(@Query() query: QueryFamilyDto) {
    return this.familiesService.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve high-level family counts and Sebeka breakdown' })
  @ApiResponse({ status: 200, description: 'Family statistics retrieved successfully' })
  async stats() {
    const stats = await this.familiesService.stats();
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single family details including members and payment ledger' })
  @ApiParam({ name: 'id', description: 'Family CUID' })
  @ApiResponse({ status: 200, description: 'Family record retrieved' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async getById(@Param('id') id: string) {
    const family = await this.familiesService.getById(id);
    return { data: family };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Registrar')
  @ApiOperation({ summary: 'Register a new family household unit' })
  @ApiResponse({ status: 201, description: 'Family registered successfully' })
  async create(
    @Body() dto: CreateFamilyDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const family = await this.familiesService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: family };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Registrar')
  @ApiOperation({ summary: 'Update family profile information' })
  @ApiParam({ name: 'id', description: 'Family CUID' })
  @ApiResponse({ status: 200, description: 'Family profile updated' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFamilyDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.familiesService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('Super Admin', 'Registrar')
  @ApiOperation({ summary: 'Archive (soft-delete) family household' })
  @ApiParam({ name: 'id', description: 'Family CUID' })
  @ApiResponse({ status: 204, description: 'Family archived successfully' })
  @ApiResponse({ status: 409, description: 'Family still contains active members' })
  async archive(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    await this.familiesService.archive(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }
}
