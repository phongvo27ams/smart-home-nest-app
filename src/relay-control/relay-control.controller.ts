import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RelayControlService } from './relay-control.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('relay-controls')
export class RelayControlController {
  constructor(private readonly relayService: RelayControlService) { }

  @Get()
  async findAll() {
    const logs = await this.relayService.findAll();
    return {
      message: 'Fetched all relay control logs',
      count: logs.length,
      data: logs,
    };
  }

  @Get('device/:id')
  async findByDevice(@Param('id', ParseIntPipe) deviceId: number) {
    const logs = await this.relayService.findByDevice(deviceId);
    return {
      message: `Fetched relay control logs for device #${deviceId}`,
      count: logs.length,
      data: logs,
    };
  }
}
