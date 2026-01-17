
import Dexie from 'dexie';
import { Report } from './types';

export class ResilientDB extends Dexie {
  // Defining the reports table using Dexie's Table type
  reports!: Dexie.Table<Report, number>;

  constructor() {
    super('ResilientConnectDB');
    // FIX: Use the version method inherited from the Dexie base class to define the schema.
    // Changing the import to a default import resolves common TypeScript typing issues with Dexie inheritance.
    this.version(1).stores({
      reports: '++id, status, category, timestamp, hasImage'
    });
  }
}

export const db = new ResilientDB();
