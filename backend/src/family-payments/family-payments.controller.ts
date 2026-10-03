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
import { FamilyPaymentsService } from './family-payments.service';
import { CreateFamilyPaymentDto } from './dto/create-family-payment.dto';
import { UpdateFamilyPaymentDto } from './dto/update-family-payment.dto';
import { QueryFamilyPaymentDto } from './dto/query-family-payment.dto';

@ApiTags('Family Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('family-payments')
export class FamilyPaymentsController {
  constructor(private readonly familyPaymentsService: FamilyPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List and paginate family Sebeka contribution records' })
  @ApiResponse({ status: 200, description: 'Paginated payment list' })
  async list(@Query() query: QueryFamilyPaymentDto) {
    return this.familyPaymentsService.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve annual Sebeka collection metrics and KPIs' })
  @ApiResponse({ status: 200, description: 'Financial metrics retrieved' })
  async stats() {
    const stats = await this.familyPaymentsService.stats();
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single family contribution payment record' })
  @ApiParam({ name: 'id', description: 'Payment record CUID' })
  @ApiResponse({ status: 200, description: 'Payment record details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getById(@Param('id') id: string) {
    const payment = await this.familyPaymentsService.getById(id);
    return { data: payment };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Record and process a family Sebeka contribution' })
  @ApiResponse({ status: 201, description: 'Payment recorded and family status synchronized' })
  @ApiResponse({ status: 400, description: 'Validation error (e.g. paid > expected)' })
  @ApiResponse({ status: 409, description: 'Contribution already exists for family & year' })
  async create(
    @Body() dto: CreateFamilyPaymentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const payment = await this.familyPaymentsService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: payment };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Update existing Sebeka contribution payment details' })
  @ApiParam({ name: 'id', description: 'Payment record CUID' })
  @ApiResponse({ status: 200, description: 'Payment record updated' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFamilyPaymentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.familyPaymentsService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }
}
