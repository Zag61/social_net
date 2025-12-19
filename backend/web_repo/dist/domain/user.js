"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    passwordHash;
    nickname;
    aboutInfo;
    phoneNumber;
    avatarFileId;
    constructor(id, passwordHash, nickname, aboutInfo, phoneNumber, avatarFileId) {
        this.id = id;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.aboutInfo = aboutInfo;
        this.phoneNumber = phoneNumber;
        this.avatarFileId = avatarFileId;
    }
    isSame(other) {
        return typeof other === 'string' ? this.id === other : this.id === other.id;
    }
    canFriend(other) {
        return this.id !== other.id;
    }
    changeNickname(newNickname) {
        if (!newNickname || newNickname.length < 2)
            throw new Error('Nickname too short');
        this.nickname = newNickname;
    }
    setPasswordHash(hash) {
        this.passwordHash = hash;
    }
    updateAbout(info) {
        this.aboutInfo = info;
    }
    updatePhone(phone) {
        this.phoneNumber = phone;
    }
    setAvatarFile(fileId) {
        this.avatarFileId = fileId;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map