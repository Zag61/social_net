"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    id;
    senderId;
    receiverId;
    text;
    sentAt;
    editedAt;
    constructor(id, senderId, receiverId, text, sentAt = new Date()) {
        this.id = id;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.text = text;
        this.sentAt = sentAt;
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
exports.Message = Message;
//# sourceMappingURL=message.js.map