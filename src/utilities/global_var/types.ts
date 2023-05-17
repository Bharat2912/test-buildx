export interface GlobalVar {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  type?: 'number' | 'string' | 'boolean' | 'json' | 'file';
  editable?: boolean;
  description?: string;
  updated_by?: 'system' | 'superadmin' | 'admin';
  created_at?: Date;
  updated_at?: Date;
}
