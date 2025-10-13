import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Device } from '../device/device.entity';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column('float', { default: 0 })
  value: number;

  @ManyToOne(() => Device, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}