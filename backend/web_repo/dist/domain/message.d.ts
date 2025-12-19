import { Timestamp, UUID } from "./types";
export declare class Message {
    readonly id: UUID;
    readonly senderId: UUID;
    readonly receiverId: UUID;
    text: string;
    readonly sentAt: Timestamp;
    private editedAt?;
    constructor(id: UUID, senderId: UUID, receiverId: UUID, text: string, sentAt?: Timestamp);
    edit(newText: string): void;
    getEditedAt(): Timestamp | undefined;
}
