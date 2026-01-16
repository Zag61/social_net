export interface InteractionDto {
userId: string;
username: string;
displayName?: string;
avatarUrl?: string | null;
lastInteractionAt: string; // ISO
}