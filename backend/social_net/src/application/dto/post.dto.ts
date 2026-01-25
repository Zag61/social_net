import { UploadedFile } from "./file.dto";

export interface PostDto {
  id: string;
  authorId: string;
  text: string;
  attachmentsPresent: boolean;
  createdAt: string; // ISO string
  attachmentsurls?: UploadedFile[];
}
