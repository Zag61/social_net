export interface PostDto {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
    likeCount?: number;
}