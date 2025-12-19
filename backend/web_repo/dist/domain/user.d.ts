import { UUID } from "./types";
export declare class User {
    readonly id: UUID;
    passwordHash: string;
    nickname: string;
    aboutInfo?: string | undefined;
    phoneNumber?: string | undefined;
    avatarFileId?: UUID | undefined;
    constructor(id: UUID, passwordHash: string, nickname: string, aboutInfo?: string | undefined, phoneNumber?: string | undefined, avatarFileId?: UUID | undefined);
    isSame(other: User | UUID): boolean;
    canFriend(other: User): boolean;
    changeNickname(newNickname: string): void;
    setPasswordHash(hash: string): void;
    updateAbout(info?: string): void;
    updatePhone(phone?: string): void;
    setAvatarFile(fileId?: UUID): void;
}
