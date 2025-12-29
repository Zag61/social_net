/**
 * Unit tests for AuthService
 *
 * Notes:
 * - We mock bcrypt, nodemailer, and crypto.randomBytes to keep tests deterministic.
 * - The AuthService file is imported AFTER mocks so the tested module uses the mocked deps.
 */

import { UnauthorizedException } from '@nestjs/common';

// --- mocks for modules that are imported by the service ---
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });
const mockTransport = { sendMail: mockSendMail };

// mock nodemailer default import
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => mockTransport),
    getTestMessageUrl: jest.fn(() => 'preview-url'),
  },
  // expose createTransport as named as well in case of different import styles
  createTransport: jest.fn(() => mockTransport),
  getTestMessageUrl: jest.fn(() => 'preview-url'),
}));

// mock crypto.randomBytes (service imports `randomBytes` from 'crypto')
const mockRandomBytes = jest.fn(() => Buffer.from('abcd', 'hex')); // -> 'abcd' hex token
jest.mock('crypto', () => ({
  randomBytes: mockRandomBytes,
}));

// mock bcrypt.compare
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

// After the above jest.mock calls we can import the service under test
import { AuthService } from './auth.service';

// We'll provide simple local mocks for UsersService and JwtService
const makeUsersServiceMock = () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  setVerificationToken: jest.fn(),
  verifyByToken: jest.fn(),
});

const makeJwtServiceMock = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersServiceMock: ReturnType<typeof makeUsersServiceMock>;
  let jwtServiceMock: ReturnType<typeof makeJwtServiceMock>;

  beforeEach(() => {
    jest.clearAllMocks();

    usersServiceMock = makeUsersServiceMock();
    jwtServiceMock = makeJwtServiceMock();

    authService = new AuthService(
      // cast to any to satisfy ctor typing in unit tests
      usersServiceMock as any,
      jwtServiceMock as any,
    );
  });

  // ---------- login ----------
  describe('login', () => {
    const validDto = { email: 'u@test.com', password: 'secret' };

    it('returns access_token when credentials are valid and user verified', async () => {
      const user = {
        id: 'user-1',
        email: 'u@test.com',
        passwordHash: 'hash',
        verified: true,
      };
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.sign.mockReturnValue('signed-jwt');

      const res = await authService.login(validDto as any);

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(validDto.password, user.passwordHash);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: user.id });
      expect(res).toEqual({ access_token: 'signed-jwt' });
    });

    it('throws UnauthorizedException if user not found or not verified', async () => {
      // user not found
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(authService.login(validDto as any)).rejects.toThrow(UnauthorizedException);

      // user found but not verified
      usersServiceMock.findByEmail.mockResolvedValue({ ...validDto, verified: false, passwordHash: 'h' });
      await expect(authService.login(validDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      const user = { id: 'u1', email: 'u@test.com', passwordHash: 'hash', verified: true };
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(validDto as any)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

  // ---------- generateJwt ----------
  describe('generateJwt', () => {
    it('calls jwtService.sign with payload containing sub and nickname', () => {
      const user = { id: 'u1', nickname: 'nick' } as any;
      jwtServiceMock.sign.mockReturnValue('tok-1');

      const token = authService.generateJwt(user);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: user.id, nickname: user.nickname });
      expect(token).toBe('tok-1');
    });
  });

  // ---------- sendVerificationEmail ----------
  describe('sendVerificationEmail', () => {
    it('generates a token, sets it on the user and sends an email with the token in the link', async () => {
      const user = { id: 'u1', email: 'u@test.com' } as any;

      usersServiceMock.setVerificationToken.mockResolvedValue(undefined);

      await authService.sendVerificationEmail(user);

      // randomBytes was used to create token; our mock returns Buffer('abcd', 'hex')
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
      const expectedToken = Buffer.from('abcd', 'hex').toString('hex'); // 'abcd'
      expect(usersServiceMock.setVerificationToken).toHaveBeenCalledWith(user.id, expectedToken);

      // nodemailer transport's sendMail must be called with appropriate fields
      expect(mockSendMail).toHaveBeenCalled();
      const sendMailCallArg = mockSendMail.mock.calls[0][0];
      expect(sendMailCallArg).toMatchObject({
        from: expect.stringContaining(process.env.SMTP_USER ?? ''), // if env var set
        to: user.email,
        subject: expect.any(String),
        html: expect.stringContaining(`/auth/verify/${expectedToken}`),
      });
    });
  });

  // ---------- verifyEmail ----------
  describe('verifyEmail', () => {
    it('returns user when verifyByToken finds a user', async () => {
      const user = { id: 'u1', email: 'x' } as any;
      usersServiceMock.verifyByToken.mockResolvedValue(user);

      const res = await authService.verifyEmail('token-1');
      expect(usersServiceMock.verifyByToken).toHaveBeenCalledWith('token-1');
      expect(res).toBe(user);
    });

    it('returns null when token invalid', async () => {
      usersServiceMock.verifyByToken.mockResolvedValue(null);
      const res = await authService.verifyEmail('bad-token');
      expect(res).toBeNull();
    });
  });

  // ---------- validateOAuthLogin ----------
  describe('validateOAuthLogin', () => {
    it('returns existing user when findByEmail finds one', async () => {
      const found = { id: 'u-ex', email: 'g@test' } as any;
      usersServiceMock.findByEmail.mockResolvedValue(found);

      const res = await authService.validateOAuthLogin({ email: 'g@test', accessToken: 'a' });
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('g@test');
      expect(res).toBe(found);
    });

    it('creates a user when none exists and returns it', async () => {
      // make sure we don't blow up on randomUUID - provide a global stub
      (global as any).crypto = { randomUUID: () => 'rand-uuid' };

      usersServiceMock.findByEmail.mockResolvedValue(null);
      const created = { id: 'created-1', email: 'new@test' } as any;
      usersServiceMock.createUser.mockResolvedValue(created);

      const res = await authService.validateOAuthLogin({ email: 'new@test', firstName: 'FN', accessToken: 'a' });
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('new@test');
      expect(usersServiceMock.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@test',
        nickname: 'FN',
      }));
      expect(res).toBe(created);
    });
  });
});
