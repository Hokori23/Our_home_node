import type { Config } from 'jest';
import path from 'path';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, '../$1'), // 使用绝对路径
  },
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['../**/*.{ts,tsx}', '!**/node_modules/**', '!**/tests/**', '!**/dist/**'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, '../../tsconfig.json'), // 使用绝对路径
        useESM: false,
      },
    ],
  },
  rootDir: '../',
  moduleDirectories: ['node_modules', '<rootDir>/src'], // 添加模块搜索路径
};

export default config;
