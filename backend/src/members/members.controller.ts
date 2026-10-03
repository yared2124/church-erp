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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

interface JwtUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List and paginate church members with search & filters' })
  @ApiResponse({ status: 200, description: 'Paginated members list' })
  async list(@Query() query: QueryMemberDto, @CurrentUser() user: JwtUser) {
    const isPriest = user.roles.includes('Priest') && !user.roles.includes('Super Admin');
    const scopedQuery: QueryMemberDto = {
      ...query,
      ...(isPriest ? { confessorPriestId: user.id } : {}),
    };

    return this.membersService.list(scopedQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve membership KPIs, gender, and age analytics' })
  @ApiResponse({ status: 200, description: 'Member statistics and demographic analytics' })
  async stats(@CurrentUser() user: JwtUser) {
    const isPriest = user.roles.includes('Priest') && !user.roles.includes('Super Admin');
    const priestId = isPriest ? user.id : undefined;

    const [stats, genderBreakdown, ageBreakdown, recent] = await Promise.all([
      this.membersService.stats(priestId),
      this.membersService.genderBreakdown(priestId),
      this.membersService.ageBreakdown(priestId),
      this.membersService.recent(4, priestId),
    ]);

    return {
      data: {
        ...stats,
        genderBreakdown,
        ageBreakdown,
        recent,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single member details with family and priest relations' })
  @ApiParam({ name: 'id', description: 'Member CUID' })
  @ApiResponse({ status: 200, description: 'Member record retrieved' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getById(@Param('id') id: string) {
    const member = await this.membersService.getById(id);
    return { data: member };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Register a new church member (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Member registered successfully' })
  @ApiResponse({ status: 422, description: 'Invalid family or validation failure' })
  async create(
    @Body() dto: CreateMemberDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const member = await this.membersService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: member };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Registrar')
  @ApiOperation({ summary: 'Update church member profile' })
  @ApiParam({ name: 'id', description: 'Member CUID' })
  @ApiResponse({ status: 200, description: 'Member profile updated' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.membersService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('Super Admin', 'Registrar')
  @ApiOperation({ summary: 'Archive (soft-delete) member record' })
  @ApiParam({ name: 'id', description: 'Member CUID' })
  @ApiResponse({ status: 204, description: 'Member archived successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async archive(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    await this.membersService.archive(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }
}
