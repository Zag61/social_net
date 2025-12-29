import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from 'src/application/services/auth.service';
import { UsersService } from 'src/application/services/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    sendVerificationEmail: jest.fn(),
    login: jest.fn(),
    generateJwt: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    verifyByToken: jest.fn(),
  };

  beforeEach(async () => {
    // reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ---------- REGISTER ----------
  describe('register', () => {
    it('resends verification when existing user is not verified', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@test.com',
        verified: false,
      });

      const dto = { email: 'a@test.com', nickname: 'nick', password: 'pwd' };

      const result = await controller.register(dto as any);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email }),
      );
      expect(result).toEqual({
        message:
          'Email already registered but not verified. Verification email resent.',
      });
    });

    it('throws BadRequestException when email already in use (and verified)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ verified: true });

      const dto = { email: 'x@test.com', nickname: 'n', password: 'p' };

      await expect(controller.register(dto as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('creates user and sends verification when email not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const createdUser = { id: 'new-id', nickname: 'new-nick' };
      mockUsersService.createUser.mockResolvedValue(createdUser);

      const dto = { email: 'new@test.com', nickname: 'new-nick', password: 'p' };

      const result = await controller.register(dto as any);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith(
        createdUser,
      );
      expect(result).toEqual({
        id: createdUser.id,
        nickname: createdUser.nickname,
        email: dto.email,
        message: 'Check your email to verify your account',
      });
    });
  });

  // ---------- VERIFY EMAIL ----------
  describe('verifyEmail', () => {
    it('verifies token and returns success message', async () => {
      mockUsersService.verifyByToken.mockResolvedValue({ id: 'u1' });

      const res = await controller.verifyEmail('token-123');
      expect(mockUsersService.verifyByToken).toHaveBeenCalledWith('token-123');
      expect(res).toEqual({ message: 'Email verified. You can now log in' });
    });

    it('throws NotFoundException for invalid token', async () => {
      mockUsersService.verifyByToken.mockResolvedValue(null);

      await expect(controller.verifyEmail('bad-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------- LOGIN ----------
  describe('login', () => {
    it('delegates to AuthService.login and returns value', async () => {
      const dto = { email: 'e', password: 'p' };
      const loginResult = { access_token: 'abc' };
      mockAuthService.login.mockResolvedValue(loginResult);

      const res = await controller.login(dto as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(res).toBe(loginResult);
    });
  });

  // ---------- CHECK TOKEN ----------
  describe('checkToken', () => {
    it('returns ok and user from request', () => {
      const fakeReq = { user: { id: 'uid', email: 'u@test' } };
      const res = controller.checkToken(fakeReq as any);
      expect(res).toEqual({ ok: true, user: fakeReq.user });
    });
  });

  // ---------- GOOGLE OAUTH ----------
  describe('google oauth routes', () => {
    it('googleAuth is a no-op (delegated to passport)', async () => {
      const res = await controller.googleAuth();
      expect(res).toBeUndefined();
    });

    it('googleAuthRedirect sets cookie and redirects', async () => {
      const fakeUser = { id: 'g1', email: 'g@test' };
      const jwt = 'jwt.token.value';
      mockAuthService.generateJwt.mockReturnValue(jwt);

      const req: any = { user: fakeUser, query: {} };

      // Mocked response object implementing the subset used by controller
      const resMock = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      const ret = await controller.googleAuthRedirect(req, resMock);

      expect(mockAuthService.generateJwt).toHaveBeenCalledWith(fakeUser);
      expect(resMock.cookie).toHaveBeenCalledWith(
        'access_token',
        jwt,
        expect.objectContaining({
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(resMock.redirect).toHaveBeenCalledWith(
        process.env.FRONTEND_URL ?? 'http://localhost:4200',
      );

      // controller returns the result of res.redirect; our mock returns undefined
      expect(ret).toBeUndefined();
    });
  });
});
