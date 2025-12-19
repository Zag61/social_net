import { Timestamp, UUID } from "./types";
export declare class Group {
    readonly id: UUID;
    name: string;
    ownerId: UUID;
    picFileId?: UUID | undefined;
    readonly createdAt: Timestamp;
    constructor(id: UUID, name: string, ownerId: UUID, picFileId?: UUID | undefined, createdAt?: Timestamp);
    rename(newName: string): void;
    changeOwner(newOwnerId: UUID): void;
    setPicture(fileId?: UUID): void;
}
