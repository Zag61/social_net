"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
class SocialService {
    friendships;
    memberships;
    constructor(friendships, memberships) {
        this.friendships = friendships;
        this.memberships = memberships;
    }
    async addFriend(userId, friendId) {
        if (userId === friendId)
            throw new Error('self');
        if (await this.friendships.exists(userId, friendId))
            return;
        await this.friendships.add(userId, friendId);
    }
    async joinGroup(userId, groupId) {
        if (await this.memberships.isMember(groupId, userId))
            return;
        await this.memberships.addUser(groupId, userId);
    }
}
exports.SocialService = SocialService;
//# sourceMappingURL=social.service.js.map