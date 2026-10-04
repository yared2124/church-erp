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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Retrieve financial overview, cashflow metrics, and charts' })
  @ApiResponse({ status: 200, description: 'Financial overview data' })
  async overview() {
    const data = await this.financeService.overview();
    return { data };
  }

  @Get('stats')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Alias for financial overview metrics and trend' })
  @ApiResponse({ status: 200, description: 'Financial overview statistics' })
  async stats() {
    const data = await this.financeService.overview();
    return { data };
  }

  @Get('transactions')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'List and paginate general ledger transactions' })
  @ApiResponse({ status: 200, description: 'Paginated transactions list' })
  async listTransactions(@Query() query: QueryTransactionDto) {
    return this.financeService.listTransactions(query);
  }

  @Get('transactions/:id')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Retrieve single transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction CUID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id') id: string) {
    const transaction = await this.financeService.getTransactionById(id);
    return { data: transaction };
  }

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Record and process a new general ledger transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created and account balance updated' })
  @ApiResponse({ status: 422, description: 'Invalid account or category reference' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const transaction = await this.financeService.createTransaction(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: transaction };
  }

  @Patch('transactions/:id')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Update or approve transaction details' })
  @ApiParam({ name: 'id', description: 'Transaction CUID' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.financeService.updateTransaction(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete('transactions/:id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete transaction and reverse ledger balance' })
  @ApiParam({ name: 'id', description: 'Transaction CUID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async deleteTransaction(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.financeService.deleteTransaction(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'List transaction categories' })
  @ApiQuery({ name: 'type', required: false, enum: ['Income', 'Expense'] })
  @ApiResponse({ status: 200, description: 'List of transaction categories' })
  async listCategories(@Query('type') type?: 'Income' | 'Expense') {
    const categories = await this.financeService.listCategories(type);
    return { data: categories };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create new transaction category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const category = await this.financeService.createCategory(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: category };
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List finance treasury/bank accounts' })
  @ApiResponse({ status: 200, description: 'List of finance accounts' })
  async listAccounts() {
    const accounts = await this.financeService.listAccounts();
    return { data: accounts };
  }

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Create new finance treasury/bank account' })
  @ApiResponse({ status: 201, description: 'Finance account created' })
  async createAccount(
    @Body() dto: CreateAccountDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const account = await this.financeService.createAccount(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: account };
  }
}
