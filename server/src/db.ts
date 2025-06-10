import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const options = [
  'option-redux',
  'option-zustand',
  'option-jotai',
  'option-context-api',
  'option-mobx',
  'option-no-global-state',
  'option-dont-care',
];

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dataDir, 'votes.db'));

const runAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(this: any, err: Error | null) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const allAsync = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const getAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: any) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

export const initDb = async () => {
  try {
    await runAsync('PRAGMA foreign_keys = ON');

    await runAsync(`
      CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
      ) STRICT
    `);

    await runAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS options_text_unique_idx ON options (text)
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        option_id INTEGER NOT NULL,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (option_id) REFERENCES options (id) ON DELETE RESTRICT
      ) STRICT
    `);

    for (const option of options) {
      const exists = await getAsync('SELECT id FROM options WHERE text = ?', [option]);
      if (!exists) {
        await runAsync(`INSERT INTO options (text) VALUES (?)`, [option]);
        logger.info(`Option "${option}" added to database`);
      }
    }

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
};

export const getOptionsWithVotes = async () => {
  try {
    return await allAsync(`
      SELECT o.id, o.text, COUNT(v.id) as votes
      FROM options o
      LEFT JOIN votes v ON o.id = v.option_id
      GROUP BY o.id
      ORDER BY votes DESC
    `);
  } catch (error) {
    logger.error('Error getting options with votes:', error);
    throw error;
  }
};

export const addVote = async (optionName: string, email?: string) => {
  try {
    const option = await getAsync('SELECT id FROM options WHERE text = ?', [optionName]);
    if (!option) {
      throw new Error(`Option '${option}' does not exist`);
    }

    const result = await runAsync(
      'INSERT INTO votes (option_id, email) VALUES (?, ?)',
      [option.id, email || null]
    );

    return { success: true, id: result.lastID, text: optionName };
  } catch (error) {
    logger.error('Error adding vote:', error);
    throw error;
  }
};

export const closeDb = () => {
  db.close((err) => {
    if (err) {
      logger.error('Error closing database:', err);
    } else {
      logger.info('Database connection closed');
    }
  });
};

export default {
  initDb,
  getOptionsWithVotes,
  addVote,
  closeDb
};
