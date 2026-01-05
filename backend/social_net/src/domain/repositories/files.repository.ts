import { Injectable } from '@nestjs/common';
import { FileRecord } from 'src/infrastructure/persistence/dao/fileDAO';
import { v4 as uuidv4 } from 'uuid';

export const FILES_REPOSITORY = 'FILES_REPOSITORY';


export interface FilesRepository {
  create(data: Omit<FileRecord, 'id' | 'created_at'>): Promise<FileRecord>;
  findById(id: string): Promise<FileRecord | null>;
}

// Example in-memory implementation (dev)
@Injectable()
export class InMemoryFilesRepository implements FilesRepository {
  private files: FileRecord[] = [];

  async create(data: Omit<FileRecord, 'id' | 'created_at'>) {
    const file: FileRecord = {
      ...data,
      id: uuidv4(),
      created_at: new Date(),
    };
    this.files.push(file);
    return file;
  }

  async findById(id: string) {
    return this.files.find((f) => f.id === id) || null;
  }
}
