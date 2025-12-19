import { UUID } from "src/domain/types";
import { FriendshipRepository } from "src/infrastructure/persistence/repositories/friendship.repository";
import { GroupMembershipRepository } from "src/infrastructure/persistence/repositories/groupMembership.repository";
export declare class SocialService {
    private readonly friendships;
    private readonly memberships;
    constructor(friendships: FriendshipRepository, memberships: GroupMembershipRepository);
    addFriend(userId: UUID, friendId: UUID): Promise<void>;
    joinGroup(userId: UUID, groupId: UUID): Promise<void>;
}
