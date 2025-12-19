"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_REPOSITORY = exports.PgUserRepository = void 0;
const common_1 = require("@nestjs/common");
const user_1 = require("../../domain/user");
let PgUserRepository = class PgUserRepository {
    async findByEmail(email) {
        return new user_1.User('1', 'hashhash', 'nick', 'ddd', '+7 993 550 37 88', '');
    }
};
exports.PgUserRepository = PgUserRepository;
exports.PgUserRepository = PgUserRepository = __decorate([
    (0, common_1.Injectable)()
], PgUserRepository);
exports.USER_REPOSITORY = Symbol('USER_REPOSITORY');
//# sourceMappingURL=user.repository.pg.js.map