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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List and paginate system users with search filters' })
  @ApiResponse({ status: 200, description: 'Paginated user list retrieved successfully' })
  async list(@Query() query: QueryUserDto) {
    return this.usersService.list(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Retrieve high-level user status statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async stats() {
    const stats = await this.usersService.stats();
    return { data: stats };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Retrieve roles summary with permission assignments' })
  @ApiResponse({ status: 200, description: 'Roles summary retrieved' })
  async roles() {
    const roles = await this.usersService.rolesSummary();
    return { data: roles };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single user profile by unique ID' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getById(id);
    return { data: user };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register and provision a new system user' })
  @ApiResponse({ status: 201, description: 'User provisioned successfully' })
  @ApiResponse({ status: 409, description: 'Email conflict' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const user = await this.usersService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing system user account' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.usersService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiResponse({ status: 200, description: 'User deletion/deactivation response' })
  @ApiResponse({ status: 400, description: 'Cannot delete own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const result = await this.usersService.delete(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: result };
  }
}
