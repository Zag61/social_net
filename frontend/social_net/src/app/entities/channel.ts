import { UUID } from "./user.types";

export class Channel {
  public readonly createdAt: Date;

  constructor(
    public readonly id: UUID,
    public name: string,
    public readonly ownerId: UUID,
    /** reference to stored picture (infra) */
    public picFileId?: UUID,
    createdAt?: Date,
  ) {
    this.createdAt = createdAt ?? new Date();
  }

  rename(newName: string) {
    if (!newName || newName.length < 2) throw new Error('Invalid channel name');
    this.name = newName;
  }

  setPicture(fileId?: UUID) {
    this.picFileId = fileId;
  }
}