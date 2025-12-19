"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEntity = void 0;
class FileEntity {
    id;
    ownerId;
    storageKey;
    name;
    sizeBytes;
    createdAt;
    constructor(id, ownerId, storageKey, name, sizeBytes, createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.storageKey = storageKey;
        this.name = name;
        this.sizeBytes = sizeBytes;
        this.createdAt = createdAt ?? new Date();
    }
    rename(newName) {
        this.name = newName;
    }
    updateStorageKey(newKey) {
        this.storageKey = newKey;
    }
}
exports.FileEntity = FileEntity;
//# sourceMappingURL=file.js.map