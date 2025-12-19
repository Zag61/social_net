import { UUID } from "src/domain/entities/types";

export interface FriendshipRepository {
  add(userId: UUID, friendId: UUID): Promise<void>;
  remove(userId: UUID, friendId: UUID): Promise<void>;
  exists(userId: UUID, friendId: UUID): Promise<boolean>;
  listFriends(userId: UUID, limit?: number, offset?: number): Promise<UUID[]>;
}

export interface GroupMembershipRepository {
  addUser(groupId: UUID, userId: UUID): Promise<void>;
  removeUser(groupId: UUID, userId: UUID): Promise<void>;
  isMember(groupId: UUID, userId: UUID): Promise<boolean>;
  listMembers(groupId: UUID, limit?: number, offset?: number): Promise<UUID[]>;
}
