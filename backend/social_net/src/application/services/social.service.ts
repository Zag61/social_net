import { UUID } from "src/domain/entities/types";
import { FriendshipRepository } from "src/domain/repositories/friendship.repository";
import { GroupMembershipRepository } from "src/domain/repositories/groupMembership.repository";

export class SocialService {
  constructor(
    private readonly friendships: FriendshipRepository,
    private readonly memberships: GroupMembershipRepository,
  ) {}

  async addFriend(userId: UUID, friendId: UUID) {
    if (userId === friendId) throw new Error('self');

    if (await this.friendships.exists(userId, friendId)) return;

    await this.friendships.add(userId, friendId);
  }

  async joinGroup(userId: UUID, groupId: UUID) {
    if (await this.memberships.isMember(groupId, userId)) return;

    await this.memberships.addUser(groupId, userId);
  }
}