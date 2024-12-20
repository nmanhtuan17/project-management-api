import { HttpStatus, Injectable } from "@nestjs/common";
import { AuthPayload, RegisterDto } from "../auth/dto/auth.dto";
import { DbService } from "@/base/db/services";
import { hashSync } from "bcrypt";
import { SystemRoles } from "@/common/types";
import { Md5 } from "ts-md5";
import { ApiError } from "@/common/errors/api.error";
import { Messages } from "@/base/config";
import { UpdateProfileDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    private db: DbService
  ) { }

  async create(data: RegisterDto, preVerified: boolean = false) {
    const { email, fullName, password } = data
    const existing = await this.db.user.findOne({ email });
    if (existing) throw new ApiError(Messages.auth.emailUsed, HttpStatus.BAD_REQUEST);
    return this.db.user.create({
      email,
      fullName,
      password: hashSync(password, 10),
      emailVerified: preVerified,
      avatar: `https://gravatar.com/avatar/${Md5.hashStr(email)}`
    })
  }

  getById(id: string) {
    return this.db.user.findOne({
      _id: id
    }).select("-password");
  }

  updateProfile(userId: string, data: UpdateProfileDto) {
    return this.db.user.findByIdAndUpdate(userId, data)
  }
}