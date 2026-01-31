import { UUID } from "./user.types";

export class Group {
  public readonly createdAt: Date;

  constructor(
    public readonly id: UUID,
    public name: string,
    public ownerId: UUID,
    /** reference to stored picture (infra) */
    public picFileId?: UUID,
    createdAt?: Date,
  ) {
    this.createdAt = createdAt ?? new Date();
  }

  rename(newName: string) {
    if (!newName || newName.length < 2) throw new Error('Invalid name');
    this.name = newName;
  }

  changeOwner(newOwnerId: UUID) {
    this.ownerId = newOwnerId;
  }

  setPicture(fileId?: UUID) {
    this.picFileId = fileId;
  }
}