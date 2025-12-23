import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttWatchRule } from './mqtt-watch-rule.entity';
import { CreateWatchRuleDto } from './dto/create-watch-rule.dto';
import { UpdateWatchRuleDto } from './dto/update-watch-rule.dto';
import { MqttService } from './mqtt.service';
import { Device } from '../device/device.entity';

@Injectable()
export class MqttWatchRuleService {
  private readonly logger = new Logger(MqttWatchRuleService.name);

  constructor(
    @InjectRepository(MqttWatchRule)
    private readonly watchRepo: Repository<MqttWatchRule>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async list(): Promise<MqttWatchRule[]> {
    return this.watchRepo.find({ order: { id: 'ASC' } });
  }

  async getMinThresholdForTopic(topic: string): Promise<number | undefined> {
    const rules = await this.watchRepo.find({ where: { topic } });
    if (rules.length === 0) return undefined;
    return rules.reduce((min, r) => (r.threshold < min ? r.threshold : min), rules[0].threshold);
  }

  async create(dto: CreateWatchRuleDto): Promise<MqttWatchRule> {
    const entity = this.watchRepo.create({ topic: dto.topic.trim(), threshold: dto.threshold });
    const saved = await this.watchRepo.save(entity);
    try {
      this.mqttService.subscribe(saved.topic);
    } catch (e) {
      this.logger.warn(`Subscribe after create failed: ${e?.message || e}`);
    }
    return saved;
  }

  async update(id: number, dto: UpdateWatchRuleDto): Promise<MqttWatchRule> {
    const rule = await this.watchRepo.findOneByOrFail({ id });
    const oldTopic = rule.topic;
    if (dto.topic !== undefined) rule.topic = dto.topic.trim();
    if (dto.threshold !== undefined) rule.threshold = dto.threshold;
    const saved = await this.watchRepo.save(rule);
    if (dto.topic && dto.topic.trim() !== oldTopic) {
      // Re-subscribe to new topic, and possibly unsubscribe old if no more rules
      try {
        this.mqttService.subscribe(saved.topic);
        const hasOtherRules = await this.watchRepo.count({ where: { topic: oldTopic } });
        const hasDevices = await this.deviceRepo.count({ where: { mqttTopic: oldTopic } });
        if (hasOtherRules === 0 && hasDevices === 0) this.mqttService.unsubscribe(oldTopic);
      } catch (e) {
        this.logger.warn(`Resubscribe after update failed: ${e?.message || e}`);
      }
    }
    return saved;
  }

  async remove(id: number): Promise<void> {
    const rule = await this.watchRepo.findOneByOrFail({ id });
    await this.watchRepo.remove(rule);
    try {
      const remaining = await this.watchRepo.count({ where: { topic: rule.topic } });
      const deviceCount = await this.deviceRepo.count({ where: { mqttTopic: rule.topic } });
      if (remaining === 0 && deviceCount === 0) this.mqttService.unsubscribe(rule.topic);
    } catch (e) {
      this.logger.warn(`Unsubscribe after delete failed: ${e?.message || e}`);
    }
  }
}
