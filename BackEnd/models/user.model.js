const db = require('../utils/db.util');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, profile_image_url, receive_emails FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, profile_image_url, receive_emails FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0];
  }

  static async validateCredentials(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return { id: result.insertId, name, email, profileImageUrl: null, receiveEmails: false };
  }

  static async updateProfile(userId, payload) {
    const fields = [];
    const values = [];

    if (payload.name) {
      fields.push('name = ?');
      values.push(payload.name);
    }

    if (payload.email) {
      fields.push('email = ?');
      values.push(payload.email);
    }

    if (payload.password) {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      fields.push('password_hash = ?');
      values.push(hashedPassword);
    }

    if (payload.profileImageUrl !== undefined) {
      fields.push('profile_image_url = ?');
      values.push(payload.profileImageUrl);
    }

    if (payload.receiveEmails !== undefined) {
      fields.push('receive_emails = ?');
      values.push(Boolean(payload.receiveEmails));
    }

    if (!fields.length) return this.findById(userId);

    values.push(userId);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await this.findById(userId);
    return updated
      ? {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          profileImageUrl: updated.profile_image_url || null,
          receiveEmails: Boolean(updated.receive_emails)
        }
      : null;
  }
}

module.exports = User;

