import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { MqttMessage } from './mqtt-message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('mqtt-messages')
export class MqttMessageController {
  constructor(
    @InjectRepository(MqttMessage)
    private readonly msgRepo: Repository<MqttMessage>,
  ) {}

  @Get()
  async list(
    @Query('topic') topic?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limitStr?: string,
  ): Promise<Array<{ id: number; topic: string; value: number; createdAt: string }>> {
    const where: any = {};
    if (topic) where.topic = topic;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (!isNaN(+fromDate) && !isNaN(+toDate)) {
        where.createdAt = Between(fromDate, toDate);
      }
    } else if (from) {
      const fromDate = new Date(from);
      if (!isNaN(+fromDate)) where.createdAt = MoreThanOrEqual(fromDate);
    } else if (to) {
      const toDate = new Date(to);
      if (!isNaN(+toDate)) where.createdAt = LessThanOrEqual(toDate);
    }

    const take = Math.min(Math.max(parseInt(limitStr || '500', 10) || 500, 1), 2000);

    const rows = await this.msgRepo.find({
      where,
      order: { createdAt: 'ASC' },
      take,
      select: { id: true, topic: true, value: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      topic: r.topic,
      value: r.value,
      createdAt: (r.createdAt as unknown as Date).toISOString?.() || String(r.createdAt),
    }));
  }
}
