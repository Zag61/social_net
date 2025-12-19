"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
class Channel {
    id;
    name;
    ownerId;
    picFileId;
    createdAt;
    constructor(id, name, ownerId, picFileId, createdAt) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.picFileId = picFileId;
        this.createdAt = createdAt ?? new Date();
    }
    rename(newName) {
        if (!newName || newName.length < 2)
            throw new Error('Invalid channel name');
        this.name = newName;
    }
    setPicture(fileId) {
        this.picFileId = fileId;
    }
}
exports.Channel = Channel;
//# sourceMappingURL=channel.js.map