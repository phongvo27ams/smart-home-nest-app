import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { DeviceService } from '../device/device.service';
import { Device } from '../device/device.entity';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,

    private readonly deviceService: DeviceService,
  ) { }

  async create(dto: CreateSensorDto): Promise<Sensor> {
    if (!dto.deviceId) {
      throw new BadRequestException('deviceId is required when creating a sensor');
    }

    const device: Device = await this.deviceService.findOne(dto.deviceId);
    if (!device) {
      throw new NotFoundException(`Device #${dto.deviceId} not found`);
    }

    const sensor = this.sensorRepo.create({
      name: dto.name,
      type: dto.type,
      value: dto.value ?? 0,
      device,
    });

    return await this.sensorRepo.save(sensor);
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorRepo.find({ relations: ['device'] });
  }

  async findOne(id: number): Promise<Sensor> {
    const sensor = await this.sensorRepo.findOne({
      where: { id },
      relations: ['device'],
    });

    if (!sensor) {
      throw new NotFoundException(`Sensor #${id} not found`);
    }

    return sensor;
  }

  async update(id: number, dto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.findOne(id);

    if (dto.deviceId) {
      const device = await this.deviceService.findOne(dto.deviceId);
      sensor.device = device;
    }

    Object.assign(sensor, dto);
    return await this.sensorRepo.save(sensor);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.findOne(id);
    await this.sensorRepo.remove(sensor);
  }

  async updateValue(id: number, value: number): Promise<Sensor> {
    const sensor = await this.findOne(id);
    sensor.value = value;
    return await this.sensorRepo.save(sensor);
  }
}