import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@ApiTags('System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Get all configured system settings' })
  @ApiResponse({ status: 200, description: 'All settings records' })
  async getAll() {
    const settings = await this.settingsService.getAll();
    return { data: settings };
  }

  @Get('church-info')
  @ApiOperation({ summary: 'Get church profile, address, and contact information' })
  @ApiResponse({ status: 200, description: 'Church information configuration' })
  async getChurchInfo() {
    const setting = await this.settingsService.get('church_information');
    return { data: setting };
  }

  @Get(':key')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Get system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key identifier' })
  @ApiResponse({ status: 200, description: 'Setting record' })
  @ApiResponse({ status: 404, description: 'Setting key not found' })
  async getByKey(@Param('key') key: string) {
    const setting = await this.settingsService.get(key);
    return { data: setting };
  }

  @Put(':key')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Create or update system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key identifier' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  async updateByKey(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser('id') actorId: string,
  ) {
    const updated = await this.settingsService.upsert(key, dto.value, actorId);
    return { data: updated };
  }
}
