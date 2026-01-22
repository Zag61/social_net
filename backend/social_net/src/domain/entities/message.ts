import { Timestamp, UUID } from "./types";

export class Message {
  private editedAt?: Timestamp;

  constructor(
    public readonly id: UUID,
    public readonly senderId: UUID,
    public readonly receiverId: UUID, // user or channel id depending on your design
    public text: string,
    public readonly sentAt: Timestamp = new Date(),
  ) {}

  edit(newText: string) {
    if (newText === this.text) return;
    this.text = newText;
    this.editedAt = new Date();
  }

  getEditedAt(): Timestamp | undefined {
    return this.editedAt;
  }
  setEditedAt(): Timestamp | undefined {
    return this.editedAt;
  }
}