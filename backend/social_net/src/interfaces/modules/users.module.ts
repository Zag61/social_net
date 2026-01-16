import { Module } from "@nestjs/common";
import { UsersController } from "../controllers/users.controller";
import { UsersService } from "src/application/services/users.service";
import { DBModule } from "./db.module";

@Module({
    imports:[DBModule],
    controllers:[UsersController]
})
export class UsersModule {}
