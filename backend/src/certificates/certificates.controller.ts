import {
  Body,
  Controller,
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
import { CertificatesService } from './certificates.service';
import { CreateCertificateRequestDto } from './dto/create-certificate-request.dto';
import { UpdateCertificateRequestDto } from './dto/update-certificate-request.dto';
import { QueryCertificateRequestDto } from './dto/query-certificate-request.dto';

@ApiTags('Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter certificate requests' })
  @ApiResponse({ status: 200, description: 'Paginated certificate requests' })
  async list(@Query() query: QueryCertificateRequestDto) {
    return this.certificatesService.list(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Retrieve certificate request type and status counts' })
  @ApiResponse({ status: 200, description: 'Certificate statistics' })
  async stats() {
    const stats = await this.certificatesService.stats();
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single certificate request by ID' })
  @ApiParam({ name: 'id', description: 'Certificate Request CUID' })
  @ApiResponse({ status: 200, description: 'Certificate request details' })
  @ApiResponse({ status: 404, description: 'Certificate request not found' })
  async getById(@Param('id') id: string) {
    const cert = await this.certificatesService.getById(id);
    return { data: cert };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Submit a new certificate request' })
  @ApiResponse({ status: 201, description: 'Certificate request created successfully' })
  @ApiResponse({ status: 422, description: 'Member not found' })
  async create(
    @Body() dto: CreateCertificateRequestDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const cert = await this.certificatesService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: cert };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Update certificate status or details' })
  @ApiParam({ name: 'id', description: 'Certificate Request CUID' })
  @ApiResponse({ status: 200, description: 'Certificate request updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid state machine transition' })
  @ApiResponse({ status: 404, description: 'Certificate request not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCertificateRequestDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.certificatesService.updateStatus(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }
}
