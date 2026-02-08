import {
  SubscribeMessage, WebSocketGateway, OnGatewayInit,
  OnGatewayConnection, OnGatewayDisconnect, WebSocketServer,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from 'src/application/services/presence.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/application/services/users.service';

@WebSocketGateway(3002)
export class PresenceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly presence: PresenceService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  afterInit() { }

  @SubscribeMessage('newMessage')
  handleNewMessage(@MessageBody() message: any) {
    console.log(message)
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace(/^Bearer\s/, '');
      if (!token) return client.disconnect(true);

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub ?? payload.id;
      (client as any).userId = userId;
      client.join(`user:${userId}`);

      // 🔼 mark online
      const newCount = await this.presence.markConnected(userId);
      const becameOnline = newCount === 1;
      const friends = await this.usersService.getFriendsIds(userId);

    // 1️⃣ Notify connected friends that this user is online
    if (becameOnline) {
      await Promise.all(friends.map(fid => this.emitToUser(fid, 'friend:online', userId)));
    }

    // 2️⃣ Send current online state of friends to the connecting user
    for (const fid of friends) {
      const isOnline = await this.presence.isOnline(fid);
      if (isOnline) {
        client.emit('friend:online', fid);
      }
    }

      

      // heartbeat
      client.on('presence:heartbeat', async () => {
        console.log('presence:heartbeat ', userId);
        await this.presence.refreshHeartbeat(userId);
      });

    } catch (err) {
      console.log(err)
      client.disconnect(true);
    }
  }


  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (!userId) return;

    const wentOffline = await this.presence.markDisconnected(userId);

    if (wentOffline) {
      const friends = await this.usersService.getFriendsIds(userId);
      friends.forEach(fid => {
        console.log('friend:offline', userId);
        this.server.to(`user:${fid}`).emit('friend:offline', userId);
      });
    }
  }
  async emitToUser(userId: string, event: string, payload: any) {
    const sockets = await this.server.in(`user:${userId}`).fetchSockets();
    console.log(sockets[0] , ' id')
    sockets.forEach(socket => socket.emit(event, payload));
  }
}

