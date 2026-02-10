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
    // robust cookie parsing
    const rawCookie = client.handshake.headers.cookie;
    if (!rawCookie) return client.disconnect();

    const token = rawCookie
      .split(';')
      .map(s => s.trim())
      .find(s => s.startsWith('access_token='))
      ?.split('=')[1];

    if (!token) return client.disconnect();

    try {
      const payload = verify(String(token), process.env.JWT_SECRET || 'secret') as any;
      const userId = payload.id;
      client.data.userId = userId;
      client.join(userId);
      console.log('call gateway connected user', userId);
    } catch (err) {
      console.warn('invalid token', err);
      client.disconnect();
    }
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: { to: string; offer: RTCSessionDescriptionInit }, @ConnectedSocket() client: Socket) {
    // send to the target user
    client.to(data.to).emit('offer', {
      from: client.data.userId,
      offer: data.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { to: string; answer: RTCSessionDescriptionInit }, @ConnectedSocket() client: Socket) {
    client.to(data.to).emit('answer', {
      from: client.data.userId,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIce(@MessageBody() data: { to: string; candidate: RTCIceCandidateInit }, @ConnectedSocket() client: Socket) {
    client.to(data.to).emit('ice', {
      from: client.data.userId,
      candidate: data.candidate,
    });
  }
}
