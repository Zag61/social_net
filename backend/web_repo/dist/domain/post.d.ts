import { Timestamp, UUID } from "./types";
export declare class Post {
    readonly id: UUID;
    readonly authorId: UUID;
    readonly channelId: UUID;
    readonly createdAt: Timestamp;
    private editedAt?;
    private text;
    private attachmentsPresent;
    constructor(id: UUID, authorId: UUID, channelId: UUID, text: string, attachmentsPresent?: boolean, createdAt?: Timestamp);
    getText(): string;
    getEditedAt(): Timestamp | undefined;
    hasAttachedFiles(): boolean;
    editText(newText: string): void;
    markHasAttachments(flag?: boolean): void;
}
