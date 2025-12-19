import { Timestamp, UUID } from "./types";

export class FileEntity {
  public readonly createdAt: Timestamp;

  /**
   * storageKey = infrastructure file identifier (S3 key, path, DB LOB id, etc.)
   * domain only keeps a reference (string), not the raw bytes
   */
  constructor(
    public readonly id: UUID,
    public readonly ownerId: UUID,
    public storageKey: string,
    public name: string,
    public readonly sizeBytes?: number,
    createdAt?: Timestamp,
  ) {
    this.createdAt = createdAt ?? new Date();
  }

  rename(newName: string) {
    this.name = newName;
  }

  updateStorageKey(newKey: string) {
    this.storageKey = newKey;
  }
}