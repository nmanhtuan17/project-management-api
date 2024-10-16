import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env',
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
