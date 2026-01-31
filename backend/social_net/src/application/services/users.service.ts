// src/application/services/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from 'src/domain/repositories/user.repository';
import type { UserRepository } from 'src/domain/repositories/user.repository';
import { User } from 'src/domain/entities/user';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { PresenceService } from './presence.service';
import { S3Service } from './s3.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepo: UserRepository,
    private readonly presenceService: PresenceService,
    private readonly s3: S3Service
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log(hashedPassword);
    const user = new User(
      uuidv4(),
      dto.email,
      hashedPassword,
      dto.nickname,
      undefined,
      undefined
    );
    console.log(user)
    await this.usersRepo.insert(user);
    return user;
  }
  async verifyByToken(token: string) {
    const user = await this.usersRepo.verifyByToken(token);
    if (!user) return null;
    user.verified = true;
    return user;
  }
  async getNicknameById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }
  async getIdByNickname(nick: string): Promise<string | null> {
    return this.usersRepo.getIdByNickname(nick);
  }
  async getProfileByNickname(nickname: string, requesterId: string | null) {
    let user = await this.usersRepo.findByNickname(nickname);
    if (user == null) { return null; }
    else if (user.id !== (requesterId ?? '')) {
      const [recentPosts, publicStats] = await Promise.all([
        this.usersRepo.findPostsByTargetUser(user.id, 20),
        this.usersRepo.getPublicData(user.id)
      ]);

      return {
        id: user.id,
        nickname: user.nickname,
        about_info: user.aboutInfo,
        avatar_file_id: user.avatarFileId,
        avatarUrl: await this.s3.getPresignedDownloadUrl(process.env.S3_BUCKET!, user.avatarFileId!),
        created_at: user.createdAt,
        publicStats,
        posts: recentPosts.map(p => ({
          id: p.id,
          author_id: p.authorId,
          text: p.text,
          attachments_present: p.attachmentsPresent,
          created_at: p.createdAt,
        }))
      };
    } else {
      const [fullUser, posts, friends] = await Promise.all([
        this.usersRepo.findFullById(user.id),
        this.usersRepo.findPostsByTargetUser(user.id, 20),
        this.usersRepo.findAcceptedFriends(user.id)
      ]);
      return {
      fullUser: {
        ...fullUser,
        avatarUrl: fullUser?.avatarFileId
          ? await this.s3.getPresignedDownloadUrl(process.env.S3_BUCKET!, fullUser.avatarFileId)
          : null
      },
      posts,
      friends
    };
    }
  }
  /* timeBackStep - how much user clicked load more, so method returns older posts */
  async getFeed(user: User, timeBackStep: number) {
    const friendsIds = await this.usersRepo.getFriendsIds(user.id);
    console.log(friendsIds)
    const postsPerFriend = await Promise.all(
      friendsIds.map((friendId: string) =>
        this.usersRepo.findPostsByTargetUser(
          friendId,
          undefined,
          timeBackStep * 5
        )
      )
    );

    return postsPerFriend.flat();
  }

  async getFriends(userId: string) {
    const friendsIds = await this.usersRepo.getFriendsIds(userId);

    // return this.usersRepo.getFriendsInfo(friendsIds);
    const users = await this.usersRepo.getFriendsInfo(friendsIds); // User[]
    if (!users) return null;

    // Use PresenceService to get statuses (inject PresenceService into UsersService)
    const presenceMap = await this.presenceService.getOnlineMap(friendsIds);

    // Optionally enforce user privacy: fetch user setting whether they allow presence.
    // For simplicity, assume allowed.

    // Attach online flag
    return Promise.all(
      users.map(async (u) => ({
        id: u.id,
        nickname: u.nickname,
        avatarUrl: u.avatarFileId
          ? await this.s3.getPresignedDownloadUrl(
            process.env.S3_BUCKET!,
            u.avatarFileId
          )
          : null,
        online: presenceMap[u.id] === true,
        // lastSeen: presenceMap[u.id] ? null : u.createdAt
      }))
    );
  }

  async getFriendsIds(userId: string) {
    return this.usersRepo.getFriendsIds(userId);
  }

  async getPeople(nickname?: string) {
    const users = await this.usersRepo.getUsersByNickname(nickname);
    if (!users) return null;

    return Promise.all(
      users.map(async (u) => ({
        id: u.id,
        nickname: u.nickname,
        avatarUrl: u.avatarFileId
          ? await this.s3.getPresignedDownloadUrl(
            process.env.S3_BUCKET!,
            u.avatarFileId
          )
          : null,
      }))
    );
  }

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<{ success: boolean; message?: string }> {
    if (requesterId === addresseeId) {
      return { success: false, message: 'Cannot send friend request to yourself' };
    }

    await this.usersRepo.createFriendRequest(requesterId, addresseeId);
    return { success: true };
  }

  async removeFriend(userId: string, otherId: string): Promise<{ success: boolean }> {
    await this.usersRepo.deleteFriendship(userId, otherId);
    return { success: true };
  }

  async updateLastSeen(userId: string) {
    return this.usersRepo.updateLastSeen(userId);
  }
}