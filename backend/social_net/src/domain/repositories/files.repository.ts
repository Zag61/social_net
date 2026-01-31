import { FileDto } from 'src/infrastructure/persistence/dao/file.dto';
export const FILES_REPOSITORY = 'FILES_REPOSITORY';

export interface FilesRepository {
  create(data: Omit<FileDto, 'id' | 'created_at'>): Promise<FileDto>;
  findById(id: string): Promise<FileDto | null>;
}
