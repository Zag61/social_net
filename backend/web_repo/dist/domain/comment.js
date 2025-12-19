"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
class Comment {
    id;
    senderId;
    postId;
    text;
    answerToCommentId;
    hasAttachedFiles;
    editedAt;
    createdAt;
    constructor(id, senderId, postId, text, answerToCommentId, hasAttachedFiles = false, createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.postId = postId;
        this.text = text;
        this.answerToCommentId = answerToCommentId;
        this.hasAttachedFiles = hasAttachedFiles;
        this.createdAt = createdAt ?? new Date();
    }
    isChainStart() {
        return !this.answerToCommentId;
    }
    edit(newText) {
        if (newText === this.text)
            return;
        this.text = newText;
        this.editedAt = new Date();
    }
    getEditedAt() {
        return this.editedAt;
    }
}
exports.Comment = Comment;
//# sourceMappingURL=comment.js.map