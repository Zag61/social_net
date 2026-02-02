// src/gateways/messages.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ namespace: '/messages', cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  }, })
@Injectable()
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const token = (client.handshake.auth && client.handshake.auth.token) || (client.handshake.query && client.handshake.query.token);
    if (!token) return client.disconnect();

    try {
      const payload = verify(String(token), process.env.JWT_SECRET || 'secret') as any;
      const userId = payload.id;
      client.join(userId);
    } catch (err) {
      client.disconnect();
    }
  }

  // emit single payload to both sender and receiver rooms
  emitMessage(payload: any) {
    const { senderId, receiverId } = payload;
    if (receiverId) this.server.to(receiverId).emit('message', payload);
    if (senderId) this.server.to(senderId).emit('message', payload);
  }

}
