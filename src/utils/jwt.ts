import User from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const comparePassword = (passwordA: string, passwordB: string) => {
  return bcrypt.compare(passwordA, passwordB);
};

export const generateToken = (id: User['id'], account: User['account']) => {
  return jwt.sign({ id, account }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '7d' });
};
