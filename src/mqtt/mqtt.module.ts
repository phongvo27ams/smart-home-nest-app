import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import { MqttGateway } from './mqtt.gateway';
import { Device } from '../device/device.entity';
import { DeviceModule } from '../device/device.module';
import { MqttWatchRule } from './mqtt-watch-rule.entity';
import { MqttWatchRuleService } from './mqtt-watch-rule.service';
import { MqttWatchRuleController } from './mqtt-watch-rule.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Device, MqttWatchRule]),
    forwardRef(() => DeviceModule),
  ],
  controllers: [MqttWatchRuleController],
  providers: [MqttService, MqttGateway, MqttWatchRuleService],
  exports: [MqttService, MqttWatchRuleService],
})
export class MqttModule {}