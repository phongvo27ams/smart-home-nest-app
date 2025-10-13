import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelayControl } from './relay-control.entity';
import { CreateRelayControlDto } from './dto/create-relay-control.dto';
import { DeviceService } from '../device/device.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class RelayControlService {
  constructor(
    @InjectRepository(RelayControl)
    private relayRepository: Repository<RelayControl>,

    @Inject(forwardRef(() => DeviceService))
    private deviceService: DeviceService,

    private userService: UserService,
  ) { }

  async create(dto: CreateRelayControlDto): Promise<RelayControl> {
    const device = await this.deviceService.findOne(dto.deviceId);
    if (!device) throw new NotFoundException('Device not found');

    let user: User | undefined;
    if (dto.userId) {
      user = await this.userService.findOne(dto.userId);
    }

    const record = this.relayRepository.create({
      device,
      user,
      action: dto.action,
      isAutomatic: dto.isAutomatic ?? false,
    });

    return this.relayRepository.save(record);
  }

  async findAll(): Promise<RelayControl[]> {
    return this.relayRepository.find({
      relations: ['device', 'user'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByDevice(deviceId: number): Promise<RelayControl[]> {
    return this.relayRepository.find({
      where: { device: { id: deviceId } },
      relations: ['device', 'user'],
      order: { timestamp: 'DESC' },
    });
  }
}