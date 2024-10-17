import { DbModule } from "@/base/db";
import { AuthController, AuthService } from "@/modules/auth";
import { Module } from "@nestjs/common";

@Module({
 imports: [
  DbModule,
 ],
 controllers: [AuthController],
 providers: [AuthService],
 exports: [AuthService]
})
export class AuthModule {
}