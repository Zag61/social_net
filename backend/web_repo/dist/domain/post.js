"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
class Post {
    id;
    authorId;
    channelId;
    createdAt;
    editedAt;
    text;
    attachmentsPresent;
    constructor(id, authorId, channelId, text, attachmentsPresent = false, createdAt) {
        this.id = id;
        this.authorId = authorId;
        this.channelId = channelId;
        this.text = text;
        this.attachmentsPresent = attachmentsPresent;
        this.createdAt = createdAt ?? new Date();
    }
    getText() {
        return this.text;
    }
    getEditedAt() {
        return this.editedAt;
    }
    hasAttachedFiles() {
        return this.attachmentsPresent;
    }
    editText(newText) {
        if (newText === this.text)
            return;
        this.text = newText;
        this.editedAt = new Date();
    }
    markHasAttachments(flag = true) {
        this.attachmentsPresent = flag;
    }
}
exports.Post = Post;
//# sourceMappingURL=post.js.map