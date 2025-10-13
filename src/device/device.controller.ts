import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    const newDevice = await this.deviceService.create(createDeviceDto);
    return {
      message: 'Device created successfully',
      data: newDevice,
    };
  }

  @Get()
  async findAll() {
    const devices = await this.deviceService.findAll();
    return {
      message: 'Devices fetched successfully',
      count: devices.length,
      data: devices,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const device = await this.deviceService.findOne(id);
    return {
      message: `Device #${id} fetched successfully`,
      data: device,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const updatedDevice = await this.deviceService.update(id, updateDeviceDto);
    return {
      message: `Device #${id} updated successfully`,
      data: updatedDevice,
    };
  }

  @Post(':id/toggle')
  async toggle(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.userId;
    const updatedDevice = await this.deviceService.toggleDevice(id, userId);
    return {
      message: 'Device toggled successfully',
      data: updatedDevice,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deviceService.remove(id);
    return {
      message: `Device #${id} deleted successfully`,
    };
  }
}
