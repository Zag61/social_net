import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "src/application/services/users.service";
import { CurrentUser, type UserPayload } from "src/infrastructure/current-user.decorator";
import { OptionalJwtAuthGuard } from "../guards/optional.jwt.auth.guard";

@Controller('posts')
export class PostsController {
  constructor(
    private readonly userService: UsersService,
  ) {}
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getUsersFeed(
    @CurrentUser() viewer:UserPayload,
    @Req() req: Request,){
    if (!viewer)  return;
    const user = await this.userService.findById(viewer.id);
    if (!user) return ;
    return this.userService.getFeed(user, 0);
  }
  
}