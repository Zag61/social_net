import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "src/application/services/users.service";
import { CurrentUser, type UserPayload } from "src/infrastructure/current-user.decorator";
import { OptionalJwtAuthGuard } from "../guards/optional.jwt.auth.guard";
import { error } from "console";

@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
  ) {}
  @UseGuards(OptionalJwtAuthGuard)
  @Get('account')
  async getUserInfoAcc(
    @CurrentUser() viewer:UserPayload,
    @Req() req: Request,){
    
    const user = await this.userService.getNicknameById(viewer?.id);
   
    if (!user?.nickname) return error; 
    let duh = await this.userService.getProfileByNickname(user.nickname, viewer?.id);
    return duh;
  }
  
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':nickname')
  async getUserInfo(@Param('nickname') nickname: string,
    @CurrentUser() viewer:UserPayload,
    @Req() req: Request,){
    
    const requesterId = viewer?.id ?? null;
    return this.userService.getProfileByNickname(nickname, requesterId);
  }
}