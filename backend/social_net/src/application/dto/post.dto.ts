export interface PostSummary {
  id: string;
  authorId: string;
  text: string;
  attachmentsPresent: boolean;
  createdAt: string; // ISO string
}
