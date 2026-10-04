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
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryItemDto } from './dto/query-inventory-item.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@ApiTags('Assets & Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ==========================================
  // Inventory Items Endpoints
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'List and filter inventory items with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of inventory items' })
  async list(@Query() query: QueryInventoryItemDto) {
    return this.inventoryService.list(query);
  }

  @Get('stats')
  @Roles('Super Admin', 'Sebeka Gubae', 'Cashier')
  @ApiOperation({ summary: 'Retrieve inventory dashboard metrics, valuation, and stock alerts' })
  @ApiResponse({ status: 200, description: 'Inventory analytics summary' })
  async stats() {
    const stats = await this.inventoryService.stats();
    return { data: stats };
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all inventory categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async listCategories() {
    const categories = await this.inventoryService.listCategories();
    return { data: categories };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create a new inventory category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const category = await this.inventoryService.createCategory(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: category };
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List all registered suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  async listSuppliers() {
    const suppliers = await this.inventoryService.listSuppliers();
    return { data: suppliers };
  }

  @Post('suppliers')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Register a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier registered' })
  async createSupplier(
    @Body() dto: CreateSupplierDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const supplier = await this.inventoryService.createSupplier(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: supplier };
  }

  @Get('movements')
  @ApiOperation({ summary: 'List recent stock movements' })
  @ApiResponse({ status: 200, description: 'List of stock movements' })
  async listMovements(@Query('itemId') itemId?: string) {
    const movements = await this.inventoryService.listMovements(itemId);
    return { data: movements };
  }

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Record a stock movement (In or Out) with automatic status adjustment' })
  @ApiResponse({ status: 201, description: 'Stock movement recorded' })
  @ApiResponse({ status: 400, description: 'Insufficient stock for Out movement' })
  async recordMovement(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const result = await this.inventoryService.recordMovement(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory Item CUID' })
  @ApiResponse({ status: 200, description: 'Item details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getById(@Param('id') id: string) {
    const item = await this.inventoryService.getById(id);
    return { data: item };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: 'Item created' })
  @ApiResponse({ status: 422, description: 'Category not found' })
  async create(
    @Body() dto: CreateInventoryItemDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const item = await this.inventoryService.create(dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: item };
  }

  @Patch(':id')
  @Roles('Super Admin', 'Sebeka Gubae')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory Item CUID' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    const updated = await this.inventoryService.update(id, dto, {
      id: actorId,
      ipAddress,
      userAgent,
    });

    return { data: updated };
  }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete an inventory item and associated stock movements' })
  @ApiParam({ name: 'id', description: 'Inventory Item CUID' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = req.headers['user-agent'];

    return this.inventoryService.remove(id, {
      id: actorId,
      ipAddress,
      userAgent,
    });
  }
}
