import { UUID } from "./types";

export class User {
  constructor(
    public readonly id: UUID,
    public readonly email: string,
    public passwordHash: string,
    public nickname: string,
    public aboutInfo?: string,
    public phoneNumber?: string,
    public avatarFileId?: UUID,
    public verified: boolean = false,                 
    public createdAt?: string,
  ) {}

  isSame(other: User | UUID): boolean {
    return typeof other === 'string' ? this.id === other : this.id === other.id;
  }

  canFriend(other: User): boolean {
    return this.id !== other.id;
  }

  changeNickname(newNickname: string) {
    if (!newNickname || newNickname.length < 2) throw new Error('Nickname too short');
    this.nickname = newNickname;
  }

  setPasswordHash(hash: string) {
    this.passwordHash = hash;
  }

  updateAbout(info?: string) {
    this.aboutInfo = info;
  }

  updatePhone(phone?: string) {
    this.phoneNumber = phone;
  }

  setAvatarFile(fileId?: UUID) {
    this.avatarFileId = fileId;
  }
}