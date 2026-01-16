interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    sentAt: Date;
    editedAt: Date | undefined;
    files: UploadedFile[]
}
interface UploadedFile{
    id: string;
    name: string;
    url: string;
}