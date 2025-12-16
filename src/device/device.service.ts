import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MqttService } from '../mqtt/mqtt.service';

import { Repository } from 'typeorm';

import { Device } from './device.entity';

import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

import { RelayControlService } from '../relay-control/relay-control.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,

    @Inject(forwardRef(() => RelayControlService))
    private relayControlService: RelayControlService,

    private readonly mqttService: MqttService,
  ) { }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    return await this.deviceRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return await this.deviceRepository.find();
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) throw new NotFoundException(`Device #${id} not found`);
    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, updateDeviceDto);
    return await this.deviceRepository.save(device);
  }

  async remove(id: number): Promise<void> {
    const device = await this.findOne(id);
    await this.deviceRepository.remove(device);
  }

  async toggleDevice(deviceId: number, userId?: number) {
    const device = await this.findOne(deviceId);
    device.isOn = !device.isOn;

    await this.deviceRepository.save(device);

    await this.relayControlService.create({
      deviceId: device.id,
      userId,
      action: device.isOn ? 'ON' : 'OFF',
      isAutomatic: false,
    });

    // Send MQTT commands to Ohstem server
    if (device.mqttTopic) {
      const message = device.isOn ? '1' : '0';
      this.mqttService.publish(device.mqttTopic, message);
      console.log(`MQTT: Sent ${message} to ${device.mqttTopic}`);
    } else {
      console.warn(`Device ${device.id} (${device.name}) has no MQTT topic defined.`);
    }

    return device;
  }

  async setBrightness(deviceId: number, brightness: number) {
    if (!Number.isInteger(brightness) || brightness < 0 || brightness > 100) {
      throw new Error('Brightness must be an integer between 0 and 100');
    }

    const device = await this.findOne(deviceId);

    if (!device.mqttTopic) {
      console.warn(`Device ${device.id} (${device.name}) has no MQTT topic defined.`);
      return device;
    }

    const message = String(brightness);
    this.mqttService.publish(device.mqttTopic, message);
    console.log(`MQTT: Sent brightness ${message} to ${device.mqttTopic}`);

    return device;
  }
}