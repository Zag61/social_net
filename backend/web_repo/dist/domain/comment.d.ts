import { Timestamp, UUID } from "./types";
export declare class Comment {
    readonly id: UUID;
    readonly senderId: UUID;
    readonly postId: UUID;
    text: string;
    readonly answerToCommentId?: UUID | undefined;
    readonly hasAttachedFiles: boolean;
    private editedAt?;
    readonly createdAt: Timestamp;
    constructor(id: UUID, senderId: UUID, postId: UUID, text: string, answerToCommentId?: UUID | undefined, hasAttachedFiles?: boolean, createdAt?: Timestamp);
    isChainStart(): boolean;
    edit(newText: string): void;
    getEditedAt(): Timestamp | undefined;
}
