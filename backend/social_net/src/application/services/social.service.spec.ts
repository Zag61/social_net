import { SocialService } from './social.service';

type UUID = string;

const makeFriendshipRepo = () => ({
  exists: jest.fn(),
  add: jest.fn(),
});

const makeMembershipRepo = () => ({
  isMember: jest.fn(),
  addUser: jest.fn(),
});

describe('SocialService', () => {
  let friendships: ReturnType<typeof makeFriendshipRepo>;
  let memberships: ReturnType<typeof makeMembershipRepo>;
  let svc: SocialService;

  beforeEach(() => {
    jest.clearAllMocks();
    friendships = makeFriendshipRepo();
    memberships = makeMembershipRepo();
    svc = new SocialService(friendships as any, memberships as any);
  });

  describe('addFriend', () => {
    it('throws "self" when userId equals friendId', async () => {
      await expect(svc.addFriend('id1' as UUID, 'id1' as UUID)).rejects.toThrow('self');
      expect(friendships.exists).not.toHaveBeenCalled();
    });

    it('does nothing when friendship already exists', async () => {
      friendships.exists.mockResolvedValue(true);

      await svc.addFriend('u1' as UUID, 'u2' as UUID);

      expect(friendships.exists).toHaveBeenCalledWith('u1', 'u2');
      expect(friendships.add).not.toHaveBeenCalled();
    });

    it('adds friendship when not exists', async () => {
      friendships.exists.mockResolvedValue(false);

      await svc.addFriend('u1' as UUID, 'u2' as UUID);

      expect(friendships.exists).toHaveBeenCalledWith('u1', 'u2');
      expect(friendships.add).toHaveBeenCalledWith('u1', 'u2');
    });
  });

  describe('joinGroup', () => {
    it('does nothing if user is already a member', async () => {
      memberships.isMember.mockResolvedValue(true);

      await svc.joinGroup('u1' as UUID, 'g1' as UUID);

      expect(memberships.isMember).toHaveBeenCalledWith('g1', 'u1');
      expect(memberships.addUser).not.toHaveBeenCalled();
    });

    it('adds user to group when not a member', async () => {
      memberships.isMember.mockResolvedValue(false);

      await svc.joinGroup('u1' as UUID, 'g1' as UUID);

      expect(memberships.isMember).toHaveBeenCalledWith('g1', 'u1');
      expect(memberships.addUser).toHaveBeenCalledWith('g1', 'u1');
    });
  });
});
