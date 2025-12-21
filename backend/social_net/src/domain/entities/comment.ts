import { Timestamp, UUID } from "./types";

export class Comment {
  private editedAt?: Timestamp;
  public readonly createdAt: Timestamp;

  constructor(
    public readonly id: UUID,
    public readonly senderId: UUID,
    public readonly postId: UUID,
    public text: string,
    /** optional: points to another comment; if undefined => chain start */
    public readonly answerToCommentId?: UUID,
    public readonly hasAttachedFiles = false,
    createdAt?: Timestamp,
  ) {
    this.createdAt = createdAt ?? new Date();
  }

  isChainStart(): boolean {
    return !this.answerToCommentId;
  }

  edit(newText: string) {
    if (newText === this.text) return;
    this.text = newText;
    this.editedAt = new Date();
  }

  getEditedAt(): Timestamp | undefined {
    return this.editedAt;
  }
}