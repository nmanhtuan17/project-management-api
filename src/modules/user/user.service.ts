import { Injectable } from "@nestjs/common";
import { RegisterDto } from "../auth/auth.dto";
import { DbService } from "@/base/db/services";
import { hashSync } from "bcrypt";
import { SystemRoles } from "@/common/types";
import { Md5 } from "ts-md5";

@Injectable()
export class UserService {
  constructor(
    private db: DbService
  ) { }
  async create(data: RegisterDto, emailVerified: boolean = false) {
    const {email, fullName, password} = data
    return this.db.user.create({
      fullName,
      password: hashSync(password, 10),
      email,
      emailVerified,
      role: SystemRoles.USER,
      avatar: `https://gravatar.com/avatar/${Md5.hashStr(email)}`
    })
  }
}