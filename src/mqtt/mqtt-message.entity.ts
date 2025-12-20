import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'mqtt_messages' })
export class MqttMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  topic: string;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'text', nullable: true })
  rawPayload?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
