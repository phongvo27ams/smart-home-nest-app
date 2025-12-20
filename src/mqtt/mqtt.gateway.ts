import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { JwtService } from '@nestjs/jwt';
import { JwtWsGuard } from '../auth/jwt-ws.guard';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_ORIGIN,
      ].filter(Boolean) as string[];

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: false,
  },
})
@Injectable()
export class MqttGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MqttGateway.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly jwtService: JwtService,
  ) { }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    this.logger.warn('TOKEN RECEIVED FROM CLIENT: ' + token);

    try {
      if (!token) {
        this.logger.warn('Missing token, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      (client as any).user = payload;

      this.logger.log(`Client connected: ${client.id}, user = ${payload.id}`);
    } catch (e) {
      this.logger.warn('INVALID TOKEN DETAILS: ' + e.message);
      client.disconnect();
    }
  }

  afterInit() {
    this.mqttService.onMessage((topic, message) => {
      const payload = parseFloat(message.toString());
      if (!isNaN(payload)) {
        this.logger.log(`Emit sensorData: [${topic}] => ${payload}`);

        this.server.sockets.sockets.forEach((socket) => {
          if ((socket as any).user) {
            socket.emit('sensorData', {
              topic,
              value: payload,
              time: new Date().toISOString(),
            });
          }
        });
      }
    });


    this.logger.log('MQTT Gateway initialized');
  }

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.emit('pong', { ok: true, user: (client as any).user });
  }
}