import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { EnergyConsumptionModule } from './energy-consumption/energy-consumption.module';
import { RelayControlModule } from './relay-control/relay-control.module';
import { SensorModule } from './sensor/sensor.module';
import { UserModule } from './user/user.module';
import { MqttModule } from './mqtt/mqtt.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      // dropSchema: true
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'MY_DEFAULT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),

    AuthModule,
    DeviceModule,
    EnergyConsumptionModule,
    RelayControlModule,
    SensorModule,
    UserModule,
    MqttModule,
  ]
})

export class AppModule { }