import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'mqtt_watch_rules' })
export class MqttWatchRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  topic: string;

  @Column({ type: 'float' })
  threshold: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
