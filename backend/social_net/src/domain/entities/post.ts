import { UUID } from "./types";

export class Post {
  public readonly createdAt: Date;
  private editedAt?: Date;
  private text: string;
  private attachmentsPresent: boolean;

  constructor(
    public readonly id: UUID,
    public readonly authorId: UUID,
    public readonly channelId: UUID,
    text: string,
    attachmentsPresent = false,
    createdAt?: Date,
  ) {
    this.text = text;
    this.attachmentsPresent = attachmentsPresent;
    this.createdAt = createdAt ?? new Date();
  }

  getText(): string {
    return this.text;
  }

  getEditedAt(): Date | undefined {
    return this.editedAt;
  }

  hasAttachedFiles(): boolean {
    return this.attachmentsPresent;
  }

  editText(newText: string) {
    if (newText === this.text) return;
    this.text = newText;
    this.editedAt = new Date();
  }

  markHasAttachments(flag = true) {
    this.attachmentsPresent = flag;
  }
}