import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService) { }

  @Post()
  async create(@Body() dto: CreateSensorDto) {
    if (!dto.deviceId) {
      throw new BadRequestException('deviceId is required when creating a sensor');
    }
    const sensor = await this.sensorService.create(dto);
    return { message: 'Sensor created successfully', data: sensor };
  }

  @Get()
  async findAll() {
    const sensors = await this.sensorService.findAll();
    return { message: 'Fetched all sensors', data: sensors };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sensor = await this.sensorService.findOne(id);
    return { message: `Fetched sensor #${id}`, data: sensor };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSensorDto) {
    const updated = await this.sensorService.update(id, dto);
    return { message: `Sensor #${id} updated successfully`, data: updated };
  }

  @Patch(':id/value')
  async updateValue(@Param('id', ParseIntPipe) id: number, @Body('value') value: number) {
    if (value === undefined || value === null) {
      throw new BadRequestException('Missing "value" field in request body');
    }
    const updated = await this.sensorService.updateValue(id, value);
    return { message: `Sensor #${id} value updated`, data: updated };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sensorService.remove(id);
    return { message: `Sensor #${id} deleted successfully` };
  }
}