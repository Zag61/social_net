import { Timestamp, UUID } from "./types";
export declare class FileEntity {
    readonly id: UUID;
    readonly ownerId: UUID;
    storageKey: string;
    name: string;
    readonly sizeBytes?: number | undefined;
    readonly createdAt: Timestamp;
    constructor(id: UUID, ownerId: UUID, storageKey: string, name: string, sizeBytes?: number | undefined, createdAt?: Timestamp);
    rename(newName: string): void;
    updateStorageKey(newKey: string): void;
}
