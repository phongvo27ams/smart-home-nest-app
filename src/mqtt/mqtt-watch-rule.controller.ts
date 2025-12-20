import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { MqttWatchRuleService } from './mqtt-watch-rule.service';
import { CreateWatchRuleDto } from './dto/create-watch-rule.dto';
import { UpdateWatchRuleDto } from './dto/update-watch-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mqtt-watch-rules')
@UseGuards(JwtAuthGuard)
export class MqttWatchRuleController {
  constructor(private readonly service: MqttWatchRuleService) {}

  @Get()
  async list() {
    return this.service.list();
  }

  @Post()
  async create(@Body() dto: CreateWatchRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWatchRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true };
  }
}
