import User from '@/models/user';
import { sequelize } from '@/database';

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('should create a user', async () => {
    const user = await User.create({
      account: 'testuser',
      password: 'testpass',
    });

    expect(user.id).toBeDefined();
    expect(user.account).toBe('testuser');
  });

  it('should validate required fields', async () => {
    await expect(User.create({} as any)).rejects.toThrow();
  });
});
