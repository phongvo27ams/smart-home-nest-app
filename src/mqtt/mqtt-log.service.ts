import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttMessage } from './mqtt-message.entity';
import { MqttWatchRuleService } from './mqtt-watch-rule.service';

@Injectable()
export class MqttLogService {
  private readonly logger = new Logger(MqttLogService.name);

  constructor(
    @InjectRepository(MqttMessage)
    private readonly mqttMessageRepo: Repository<MqttMessage>,
    @Inject(forwardRef(() => MqttWatchRuleService))
    private readonly watchService: MqttWatchRuleService,
  ) {}

  async logIfHigh(topic: string, message: Buffer): Promise<void> {
    const minThreshold = await this.watchService.getMinThresholdForTopic(topic);
    if (minThreshold === undefined) return;

    const payload = message.toString().trim();
    const values = this.extractNumbers(payload).filter((v) => v > minThreshold);
    if (values.length === 0) return;

    const records: Partial<MqttMessage>[] = values.map((v) => ({
      topic,
      value: v,
      rawPayload: payload,
    }));

    try {
      await this.mqttMessageRepo.insert(records);
      this.logger.log(`Saved ${records.length} MQTT log(s) for topic "${topic}" exceeding threshold ${minThreshold}`);
    } catch (err) {
      this.logger.error(`Failed to save MQTT log for topic "${topic}": ${err?.message || err}`);
    }
  }

  private extractNumbers(text: string): number[] {
    const matches = text.match(/-?\d+(?:[\.,]\d+)?/g);
    if (!matches) return [];
    return matches
      .map((m) => m.replace(',', '.'))
      .map((m) => Number.parseFloat(m))
      .filter((n) => Number.isFinite(n));
  }
}
