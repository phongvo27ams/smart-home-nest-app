import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: false })
  isOn: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 1 })
  priority: number;

  @Column({ type: 'float', nullable: true })
  powerValue?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}