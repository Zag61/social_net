// src/gateways/call.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/call',
})
@Injectable()
export class CallGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const token = client.handshake.headers.cookie?.replace('access_token=', '');
    if (!token) return client.disconnect();

    try {
      const payload = verify(
        String(token),
        process.env.JWT_SECRET || 'secret',
      ) as any;
      const userId = payload.id;
      console.log(userId)

      client.data.userId = userId;

      client.join(userId);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('offer', {
      from: client.data.userId,
      offer: data.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('answer', {
      from: client.data.userId,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice')
  handleIce(
    @MessageBody() data,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('ice', {
      from: client.data.userId,
      candidate: data.candidate,
    });
  }
}
