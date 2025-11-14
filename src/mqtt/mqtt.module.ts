import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import { MqttGateway } from './mqtt.gateway';
import { Device } from '../device/device.entity';
import { DeviceModule } from '../device/device.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    forwardRef(() => DeviceModule),
  ],
  providers: [MqttService, MqttGateway],
  exports: [MqttService],
})
export class MqttModule {}