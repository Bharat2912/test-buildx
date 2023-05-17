import {OrderByColumn, SortOrder} from './enum';

export type SearchObject = {[key: string]: string};

export interface ISeeds {
  directory: string | undefined;
}
export interface IMigrations {
  directory: string | undefined;
  schemaName: string | undefined;
}
export interface IDBConnection {
  user: string | undefined;
  password: string | undefined;
  host: string | undefined;
  port: string | undefined;
  database: string | undefined;
}
export interface IDBConfig {
  client: string | undefined;
  connection: string | IDBConnection | undefined;
  migrations: IMigrations | undefined;
  seeds: ISeeds | undefined;
  searchPath: string[] | undefined;
}
export interface IKnexConfig {
  DEV: IDBConfig;
  PROD: IDBConfig;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IResponseError {
  status: boolean;
  statusCode: number;
  errors?: IError[];
  result?: any;
}

export interface IError {
  message: string;
  code: number;
  data?: any;
}

export interface IPagination {
  page_index: number;
  page_size: number;
}
export interface IOrderBy {
  column: OrderByColumn;
  order: SortOrder;
}

export interface ICoordinate {
  latitude: number;
  longitude: number;
}
