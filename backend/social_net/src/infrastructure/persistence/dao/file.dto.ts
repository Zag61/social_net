export type FileDto = {
  id: string;
  owner_id: string;
  name: string;
  backend: 'db' | 'object_storage';
  storage_bucket?: string;
  storage_key?: string;
  size_bytes: number;
  created_at: Date;
};