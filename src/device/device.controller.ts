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
  NotFoundException,
  InternalServerErrorException,
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

    try {
      const updatedDevice = await this.deviceService.toggleDevice(id, userId);

      // If the device does not have an MQTT topic yet
      if (!updatedDevice.mqttTopic) {
        throw new NotFoundException(
          `Device #${id} (${updatedDevice.name}) does not have an MQTT topic.`,
        );
      }

      return {
        success: true,
        message: `Device "${updatedDevice.name}" toggled ${updatedDevice.isOn ? 'ON' : 'OFF'} successfully`,
        data: {
          id: updatedDevice.id,
          name: updatedDevice.name,
          isOn: updatedDevice.isOn,
          mqttTopic: updatedDevice.mqttTopic,
        },
      };
    } catch (error) {
      console.error('Error toggling device:', error);
      throw new InternalServerErrorException(
        `Failed to toggle device #${id}: ${error.message}`,
      );
    }
  }

  @Post(':id/brightness')
  async setBrightness(
    @Param('id', ParseIntPipe) id: number,
    @Body('brightness') brightness: number,
  ) {
    const updatedDevice = await this.deviceService.setBrightness(id, brightness);

    if (!updatedDevice.mqttTopic) {
      throw new NotFoundException(
        `Device #${id} (${updatedDevice.name}) does not have an MQTT topic.`,
      );
    }

    return {
      success: true,
      message: `Brightness set to ${brightness} for device "${updatedDevice.name}"`,
      data: {
        id: updatedDevice.id,
        name: updatedDevice.name,
        mqttTopic: updatedDevice.mqttTopic,
        brightness,
      },
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
