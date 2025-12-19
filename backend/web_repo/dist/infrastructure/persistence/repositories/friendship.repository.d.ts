import { UUID } from "src/domain/types";
export interface FriendshipRepository {
    add(userId: UUID, friendId: UUID): Promise<void>;
    remove(userId: UUID, friendId: UUID): Promise<void>;
    exists(userId: UUID, friendId: UUID): Promise<boolean>;
    listFriends(userId: UUID, limit?: number, offset?: number): Promise<UUID[]>;
}
