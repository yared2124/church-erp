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
import { SacramentsService } from './sacraments.service';
import { CreateSacramentDto } from './dto/create-sacrament.dto';
import { UpdateSacramentDto } from './dto/update-sacrament.dto';
import { QuerySacramentDto } from './dto/query-sacrament.dto';

@ApiTags('Sacraments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sacraments')
export class SacramentsController {
  constructor(private readonly sacramentsService: SacramentsService) {}

  @Get()
  @ApiOperation({ summary: 'List and paginate sacrament registrations' })
  @ApiResponse({ status: 200, description: 'Paginated sacrament records' })
  async list(@Query() query: QuerySacramentDto) {
    return this.sacramentsService.list(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Retrieve sacrament type and status distribution counts' })
  @ApiResponse({ status: 200, description: 'Sacrament statistics' })
  async stats() {
    const stats = await this.sacramentsService.stats();
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single sacrament record by ID' })
  @ApiParam({ name: 'id', description: 'Sacrament CUID' })
  @ApiResponse({ status: 200, description: 'Sacrament record details' })
  @ApiResponse({ status: 404, description: 'Sacrament not found' })
  async getById(@Param('id') id: string) {
    const sacrament = await this.sacramentsService.getById(id);
    return { data: sacrament };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Register a new sacrament (Baptism, Marriage, or Burial)' })
  @ApiResponse({ status: 201, description: 'Sacrament registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error (e.g., Marriage missing secondary member)' })
  @ApiResponse({ status: 422, description: 'Member or family reference not found' })
  async create(
    @Body() dto: CreateSacramentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const sacrament = await this.sacramentsService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: sacrament };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Registrar', 'Priest')
  @ApiOperation({ summary: 'Update sacrament details or approval status' })
  @ApiParam({ name: 'id', description: 'Sacrament CUID' })
  @ApiResponse({ status: 200, description: 'Sacrament record updated' })
  @ApiResponse({ status: 404, description: 'Sacrament not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSacramentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.sacramentsService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }
}
