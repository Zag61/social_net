import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { UserService } from "../../app/features/user.service";
import { firstValueFrom } from "rxjs";

export const messageResolver: ResolveFn<Message[]> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userService = inject(UserService);
  const nickname = route.paramMap.get('nickname')!;
  const raw = await firstValueFrom(userService.getMessages(nickname));
  console.log(raw)
  return raw;
};