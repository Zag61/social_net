/**
 * Unit tests for UsersService
 *
 * Mocks:
 * - usersRepo (insert, findByEmail, findById, update, findByVerificationToken)
 * - bcrypt.hash
 * - uuid.v4
 *
 * These tests are pure unit tests: no DB, no Nest DI.
 */

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

jest.mock('uuid', () => ({
    v4: () => 'fixed-uuid-123',
}));

import { UsersService } from './users.service';
import { User } from 'src/domain/entities/user';

const makeUsersRepo = () => ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    findByVerificationToken: jest.fn(),
});

describe('UsersService', () => {
    let usersRepo: ReturnType<typeof makeUsersRepo>;
    let svc: UsersService;

    beforeEach(() => {
        jest.clearAllMocks();
        usersRepo = makeUsersRepo();
        svc = new UsersService(usersRepo as any);
    });

    describe('findByEmail / findById', () => {
        it('delegates findByEmail', async () => {
            usersRepo.findByEmail.mockResolvedValue({ id: 'u1' });
            const res = await svc.findByEmail('a@test');
            expect(usersRepo.findByEmail).toHaveBeenCalledWith('a@test');
            expect(res).toEqual({ id: 'u1' });
        });

        it('delegates findById', async () => {
            usersRepo.findById.mockResolvedValue({ id: 'u2' });
            const res = await svc.findById('u2');
            expect(usersRepo.findById).toHaveBeenCalledWith('u2');
            expect(res).toEqual({ id: 'u2' });
        });
    });

    describe('createUser', () => {
        it('hashes password, inserts user and returns created user', async () => {
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
            usersRepo.insert.mockResolvedValue(undefined);

            const dto = {
                email: 'x@test',
                password: 'pw',
                nickname: 'nick',
            };

            const user = await svc.createUser(dto as any);

            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe('fixed-uuid-123');
            expect(user.email).toBe(dto.email);
            expect(user.passwordHash).toBe('hashed-pass');
            expect(user.nickname).toBe(dto.nickname);

            expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
            expect(usersRepo.insert).toHaveBeenCalledWith(user);
        });

        describe('setVerificationToken', () => {
            it('sets token and updates user when user exists', async () => {
                const user = new User(
                    'u1',
                    'a@b',
                    'hash',
                    'nick',
                    undefined,
                    undefined,
                    undefined,
                    false,
                    null,
                );

                usersRepo.findById.mockResolvedValue(user);
                usersRepo.update.mockResolvedValue(undefined);

                await svc.setVerificationToken('u1', 'tok-1');

                expect(user.verificationToken).toBe('tok-1');
                expect(usersRepo.update).toHaveBeenCalledWith(user);
            });


            it('throws when user not found', async () => {
                usersRepo.findById.mockResolvedValue(null);

                await expect(svc.setVerificationToken('u-no', 't')).rejects.toThrow('User not found');
                expect(usersRepo.update).not.toHaveBeenCalled();
            });
        });

        describe('verifyByToken', () => {
            it('verifies user and clears token', async () => {
                const user = new User(
                    'u1',
                    'a@b',
                    'hash',
                    'nick',
                    undefined,
                    undefined,
                    undefined,
                    false,
                    'tok',
                );

                usersRepo.findByVerificationToken.mockResolvedValue(user);
                usersRepo.update.mockResolvedValue(undefined);

                const res = await svc.verifyByToken('tok');

                expect(res).toBe(user);
                expect(user.verified).toBe(true);
                expect(user.verificationToken).toBeNull();
                expect(usersRepo.update).toHaveBeenCalledWith(user);
            });


            it('returns null when token not found', async () => {
                usersRepo.findByVerificationToken.mockResolvedValue(null);

                const res = await svc.verifyByToken('bad');
                expect(res).toBeNull();
            });
        });
    })});
