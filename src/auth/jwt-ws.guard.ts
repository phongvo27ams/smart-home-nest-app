import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token;
    console.log('WebSocket connection attempt with token:', token);

    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      (client as any).user = payload;
      return true;
    } catch (err) {
      if (err instanceof Error) {
        console.error('WebSocket JWT verification failed:', err.message);
      } else {
        console.error('WebSocket JWT verification failed:', err);
      }
      return false;
    }
  }
}