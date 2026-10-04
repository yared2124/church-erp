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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/create-maintenance.dto';

@ApiTags('Properties & Rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ==========================================
  // Properties Endpoints
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'List and filter properties with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of properties' })
  async list(@Query() query: QueryPropertyDto) {
    return this.propertiesService.list(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Retrieve property and rental dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Property and lease analytics' })
  async stats() {
    const stats = await this.propertiesService.stats();
    return { data: stats };
  }

  @Get('payments')
  @ApiOperation({ summary: 'List recent rent payments' })
  @ApiResponse({ status: 200, description: 'List of rent payments' })
  async listPayments(@Query('leaseAgreementId') leaseAgreementId?: string) {
    const payments = await this.propertiesService.listRentPayments(leaseAgreementId);
    return { data: payments };
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'List maintenance requests' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests' })
  async listMaintenance(@Query('propertyId') propertyId?: string) {
    const maintenance = await this.propertiesService.listMaintenance(propertyId);
    return { data: maintenance };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single property with leases and maintenance' })
  @ApiParam({ name: 'id', description: 'Property CUID' })
  @ApiResponse({ status: 200, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getById(@Param('id') id: string) {
    const property = await this.propertiesService.getById(id);
    return { data: property };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create a new property unit' })
  @ApiResponse({ status: 201, description: 'Property created' })
  @ApiResponse({ status: 409, description: 'Unit name already exists' })
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const property = await this.propertiesService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: property };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Update property unit details' })
  @ApiParam({ name: 'id', description: 'Property CUID' })
  @ApiResponse({ status: 200, description: 'Property updated' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.propertiesService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete property unit (only if no active leases)' })
  @ApiParam({ name: 'id', description: 'Property CUID' })
  @ApiResponse({ status: 200, description: 'Property deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete property with active leases' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.propertiesService.remove(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }

  // ==========================================
  // Leases Endpoints
  // ==========================================

  @Post('leases')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create and activate a lease agreement for a property' })
  @ApiResponse({ status: 201, description: 'Lease agreement activated' })
  @ApiResponse({ status: 400, description: 'Property already occupied or invalid dates' })
  async createLease(
    @Body() dto: CreateLeaseDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const lease = await this.propertiesService.createLease(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: lease };
  }

  @Patch('leases/:id/terminate')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Terminate an active lease agreement' })
  @ApiParam({ name: 'id', description: 'Lease Agreement CUID' })
  @ApiResponse({ status: 200, description: 'Lease terminated, property vacated' })
  async terminateLease(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const terminated = await this.propertiesService.terminateLease(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: terminated };
  }

  // ==========================================
  // Rent Payments Endpoints
  // ==========================================

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Record a rent payment for an active lease' })
  @ApiResponse({ status: 201, description: 'Payment recorded' })
  async createPayment(
    @Body() dto: CreateRentPaymentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const payment = await this.propertiesService.createRentPayment(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: payment };
  }

  // ==========================================
  // Maintenance Endpoints
  // ==========================================

  @Post('maintenance')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create a maintenance request for a property' })
  @ApiResponse({ status: 201, description: 'Maintenance request logged' })
  async createMaintenance(
    @Body() dto: CreateMaintenanceDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const maintenance = await this.propertiesService.createMaintenance(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: maintenance };
  }

  @Patch('maintenance/:id')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Update status or priority of maintenance request' })
  @ApiParam({ name: 'id', description: 'Maintenance Request CUID' })
  @ApiResponse({ status: 200, description: 'Maintenance request updated' })
  async updateMaintenance(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.propertiesService.updateMaintenance(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }
}
