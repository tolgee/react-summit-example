import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dateFormat from 'dateformat';
import { logger } from './logger';

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'votes.db');
let db: sqlite3.Database | null = null

const createAsync = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        reject(err);
      } else {
        logger.info('Database connection opened');
        resolve(true);
      }
    });
  })
}

const runAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db!.run(sql, params, function(this: any, err: Error | null) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const allAsync = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db!.all(sql, params, (err: Error | null, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const getAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db!.get(sql, params, (err: Error | null, row: any) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const renameAsync = (oldPath: string, newPath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
};

export const initDb = async () => {
  try {
    await createAsync();

    await runAsync('PRAGMA foreign_keys = ON');

    await runAsync(`
      CREATE TABLE IF NOT EXISTS options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        deleted_at TEXT DEFAULT NULL
      ) STRICT
    `);

    await runAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS options_text_unique_idx ON options (text, deleted_at)
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        option_id INTEGER NOT NULL,
        email TEXT,
        name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (option_id) REFERENCES options (id) ON DELETE RESTRICT
      ) STRICT
    `);

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
      WHERE o.deleted_at IS NULL
      GROUP BY o.id
      ORDER BY votes DESC, o.id
    `);
  } catch (error) {
    logger.error('Error getting options with votes:', error);
    throw error;
  }
};

export const addOption = async (option: string) => {
  try {
    const exists = await getAsync('SELECT id FROM options WHERE deleted_at IS NULL AND text = ?', [option]);
    if (exists) {
      throw new Error(`Option '${option}' already exists`);
    }
    await runAsync(`
        INSERT INTO options (text)
        VALUES (?)
    `, [option]);
    logger.info(`Option "${option}" added to database`);
  } catch (error) {
    logger.error('Error adding option:', error);
    throw error;
  }
}

export const deleteOption = async (option: string) => {
  try {
    const exists = await getAsync('SELECT id FROM options WHERE deleted_at IS NULL AND text = ?', [option]);
    if (!exists) {
      throw new Error(`Option '${option}' does not exist`);
    }
    await runAsync(`
        UPDATE options
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE deleted_at IS NULL AND text = ?
    `)
  } catch (error) {
    logger.error('Error deleting option:', error);
    throw error;
  }
}

export const addVote = async (optionName: string, email?: string, name?: string) => {
  try {
    const option = await getAsync('SELECT id FROM options WHERE text = ?', [optionName]);
    if (!option) {
      throw new Error(`Option '${option}' does not exist`);
    }

    const result = await runAsync(
      'INSERT INTO votes (option_id, email, name) VALUES (?, ?, ?)',
      [option.id, email || null, name || null]
    );

    return { success: true, id: result.lastID, text: optionName };
  } catch (error) {
    logger.error('Error adding vote:', error);
    throw error;
  }
};

export const resetDb = async () => {
  const oldDb = db;
  if (oldDb === null) {
    throw new Error('Database not initialized');
  }

  try {
    db = null;
    await closeDbInternal(oldDb);
    const backupDbPath = path.join(dataDir, `votes_${dateFormat(Date.now(), 'yyyy-mm-dd_HH-MM-ss_l')}.db`);
    await renameAsync(dbPath, backupDbPath);
    await initDb();
  } catch (error) {
    logger.error('Error reinitializing database:', error);
    process.exit(1);
  }
}

const closeDbInternal = (db: sqlite3.Database) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        logger.error('Error closing database:', err);
        reject(err);
      } else {
        logger.info('Database connection closed');
        resolve(true);
      }
    });
  })
};

export const closeDb = async () => await closeDbInternal(db!);

export default {
  initDb,
  getOptionsWithVotes,
  addVote,
  closeDb
};
