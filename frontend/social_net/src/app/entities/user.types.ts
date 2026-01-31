export interface UserDto {
id: string;
username: string;
displayName?: string;
avatarUrl?: string | null;
bio?: string | null;
createdAt?: string;
}
export interface Friend {
  id: string;
  email: string;  
  passwordHash: string;
  nickname: string;
  avatarFileId?: string;
  verified: boolean;
  avatarUrl?: string;
  online?: boolean; 
}

export type UUID = string;
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

  // identity check
  isSame(other: User | UUID): boolean {
    return typeof other === 'string' ? this.id === other : this.id === other.id;
  }

  // domain rules expressed on entity
  canFriend(other: User): boolean {
    return this.id !== other.id;
  }

  // simple state mutators (keep business rules here)
  changeNickname(newNickname: string) {
    if (!newNickname || newNickname.length < 2) throw new Error('Nickname too short');
    this.nickname = newNickname;
  }

  setPasswordHash(hash: string) {
    // validation can be added here
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