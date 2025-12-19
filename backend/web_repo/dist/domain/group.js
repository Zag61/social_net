"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
class Group {
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
            throw new Error('Invalid name');
        this.name = newName;
    }
    changeOwner(newOwnerId) {
        this.ownerId = newOwnerId;
    }
    setPicture(fileId) {
        this.picFileId = fileId;
    }
}
exports.Group = Group;
//# sourceMappingURL=group.js.map