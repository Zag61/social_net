import { UUID } from "./user.types";

export class Comment {
  private editedAt?: Date;
  public readonly createdAt: Date;

  constructor(
    public readonly id: UUID,
    public readonly senderId: UUID,
    public readonly postId: UUID,
    public text: string,
    /** optional: points to another comment; if undefined => chain start */
    public readonly answerToCommentId?: UUID,
    public readonly hasAttachedFiles = false,
    createdAt?: Date,
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

  getEditedAt(): Date | undefined {
    return this.editedAt;
  }
}