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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto } from './dto/create-leave-request.dto';

@ApiTags('Employees & HR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ==========================================
  // Employees Endpoints
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'List and filter employees with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of employees' })
  async list(@Query() query: QueryEmployeeDto) {
    return this.employeesService.list(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Retrieve workforce metrics, department distribution, and leave stats' })
  @ApiResponse({ status: 200, description: 'Employee analytics summary' })
  async stats() {
    const stats = await this.employeesService.stats();
    return { data: stats };
  }

  @Get('leaves')
  @ApiOperation({ summary: 'List employee leave requests' })
  @ApiResponse({ status: 200, description: 'List of leave requests' })
  async listLeaves(@Query('employeeId') employeeId?: string) {
    const leaves = await this.employeesService.listLeaveRequests(employeeId);
    return { data: leaves };
  }

  @Post('leaves')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Submit a new leave request for an employee' })
  @ApiResponse({ status: 201, description: 'Leave request submitted' })
  async createLeave(
    @Body() dto: CreateLeaveRequestDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const leave = await this.employeesService.createLeaveRequest(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: leave };
  }

  @Patch('leaves/:id/status')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Approve or reject an employee leave request' })
  @ApiParam({ name: 'id', description: 'Leave Request CUID' })
  @ApiResponse({ status: 200, description: 'Leave status updated' })
  async updateLeaveStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveStatusDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.employeesService.updateLeaveStatus(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single employee details with history and leaves' })
  @ApiParam({ name: 'id', description: 'Employee CUID' })
  @ApiResponse({ status: 200, description: 'Employee record' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async getById(@Param('id') id: string) {
    const employee = await this.employeesService.getById(id);
    return { data: employee };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Register a new employee record' })
  @ApiResponse({ status: 201, description: 'Employee created' })
  async create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const employee = await this.employeesService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: employee };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Update employee details' })
  @ApiParam({ name: 'id', description: 'Employee CUID' })
  @ApiResponse({ status: 200, description: 'Employee updated' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.employeesService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete an employee record' })
  @ApiParam({ name: 'id', description: 'Employee CUID' })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.employeesService.remove(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }
}
