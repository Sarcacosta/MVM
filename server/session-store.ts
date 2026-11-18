import type Database from 'better-sqlite3';
import session from 'express-session';

export class SqlStore extends session.Store {
  constructor(private db: Database.Database) {
    super();
  }
  get(sid: string, cb: any) {
    try {
      const r = this.db
        .prepare('SELECT data FROM sessions WHERE sid=? AND expires>?')
        .get(sid, Date.now()) as any;
      cb(null, r ? JSON.parse(r.data) : null);
    } catch (e) {
      cb(e);
    }
  }
  set(sid: string, data: any, cb: any) {
    try {
      this.db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
      this.db
        .prepare('INSERT OR REPLACE INTO sessions VALUES(?,?,?)')
        .run(sid, JSON.stringify(data), Date.now() + 8 * 3600000);
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }
  destroy(sid: string, cb: any) {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }
}
