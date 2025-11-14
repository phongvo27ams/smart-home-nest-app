import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mqtt from 'mqtt';
import { Device } from '../device/device.entity';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;
  private onMessageCallback?: (topic: string, message: Buffer) => void;

  private readonly MQTT_HOST = 'mqtt.ohstem.vn';
  private readonly MQTT_PORT = 1883;
  private readonly MQTT_USERNAME = '27C45UV';
  private readonly MQTT_PASSWORD = '';
  private readonly CLIENT_ID = 'nestjs-' + Math.random().toString(16).substr(2, 8);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) { }

  async onModuleInit() {
    this.connectToBroker();
  }

  private connectToBroker() {
    const url = `mqtt://${this.MQTT_HOST}:${this.MQTT_PORT}`;
    this.client = mqtt.connect(url, {
      clientId: this.CLIENT_ID,
      username: this.MQTT_USERNAME,
      password: this.MQTT_PASSWORD,
      reconnectPeriod: 3000,
    });

    this.client.on('connect', async () => {
      this.logger.log(`Connected to MQTT broker as ${this.CLIENT_ID}`);

      const devices = await this.deviceRepo.find();
      for (const device of devices) {
        const topic = device.mqttTopic;
        this.subscribe(topic);
      }
    });


    this.client.on('error', (err) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('message', (topic, message) => {
      this.logger.debug(`Received [${topic}]: ${message.toString()}`);
      if (this.onMessageCallback) this.onMessageCallback(topic, message);
    });
  }

  publish(topic: string, message: string) {
    if (!this.client?.connected)
      return this.logger.error('Cannot publish: MQTT client not connected');

    this.client.publish(topic, message, { qos: 0, retain: false }, (err) => {
      if (err) this.logger.error(`Publish error: ${err.message}`);
      else this.logger.log(`Published "${message}" to ${topic}`);
    });
  }

  subscribe(topic: string) {
    if (!this.client?.connected)
      return this.logger.warn(`MQTT not connected, will subscribe to ${topic} later`);
    this.client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) this.logger.error(`Subscribe error: ${err.message}`);
      else this.logger.log(`Subscribed to ${topic}`);
    });
  }

  onMessage(callback: (topic: string, message: Buffer) => void) {
    this.onMessageCallback = callback;
  }

  onModuleDestroy() {
    if (this.client) {
      this.logger.log('Closing MQTT connection...');
      this.client.end();
    }
  }
}