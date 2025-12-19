import { Timestamp, UUID } from "./types";
export declare class Channel {
    readonly id: UUID;
    name: string;
    readonly ownerId: UUID;
    picFileId?: UUID | undefined;
    readonly createdAt: Timestamp;
    constructor(id: UUID, name: string, ownerId: UUID, picFileId?: UUID | undefined, createdAt?: Timestamp);
    rename(newName: string): void;
    setPicture(fileId?: UUID): void;
}
