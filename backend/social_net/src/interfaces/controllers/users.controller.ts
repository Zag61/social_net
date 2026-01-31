import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "src/application/services/users.service";
import { CurrentUser, type UserPayload } from "src/infrastructure/current-user.decorator";
import { OptionalJwtAuthGuard } from "../guards/optional.jwt.auth.guard";
import { error } from "console";
import { JwtAuthGuard } from "../guards/auth.guard";

@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) { }
  @UseGuards(OptionalJwtAuthGuard)
  @Get('account')
  async getUserInfoAcc(
    @CurrentUser() viewer: UserPayload,
    @Req() req: Request,) {
    const user = await this.userService.getNicknameById(viewer?.id);
    if (!user?.nickname) return error;
    let duh = await this.userService.getProfileByNickname(user.nickname, viewer?.id);
    console.log(duh)
    return duh;
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriends(@CurrentUser() viewer: UserPayload, @Req() req: Request,) {
    return this.userService.getFriends(viewer.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('people')
  async getPeople(@CurrentUser() viewer: UserPayload, @Req() req: Request, @Query('nickname') nickname?: string,) {
    const user = await this.userService.getNicknameById(viewer?.id);
    if (!user) return;
    return this.userService.getPeople(nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends')
  async sendFriendRequest(
    @CurrentUser() viewer: UserPayload,
    @Body() dto: { addresseeId: string },
  ) {
    return this.userService.sendFriendRequest(viewer.id, dto.addresseeId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/remove')
  async removeFriend(
    @CurrentUser() viewer: UserPayload,
    @Body() dto: { friendId: string },
  ) {
    return this.userService.removeFriend(viewer.id, dto.friendId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':nickname')
  async getUserInfo(@Param('nickname') nickname: string,
    @CurrentUser() viewer: UserPayload,
    @Req() req: Request,) {

    const requesterId = viewer?.id ?? null;
    return this.userService.getProfileByNickname(nickname, requesterId);
  }
}