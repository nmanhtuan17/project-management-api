import { DbService } from "@/base/db/services";
import { NofiticationDto } from "@/modules/notification/dto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(
    private db: DbService,
    private config: ConfigService
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.get('firebase.projectId'),
        privateKey: config.get('firebase.privateKey').replace(/\\n/g, '\n'),
        clientEmail: config.get('firebase.clientEmail'),
      }),
    });
  }

  async registerToken(token: string, userId: string) {
    const existingToken = await this.db.deviceToken.findOne({ fcmToken: token, user: userId })
    if (!existingToken) {
      return await this.db.deviceToken.create({ fcmToken: token, user: userId })
    }
  }

  async sendNotification(userId: string, notification: { title: string, body: string }) {
    const tokens = await this.db.deviceToken.find({ user: userId })
    if (!tokens.length) return;

    const message = {
      notification: notification,
      tokens: tokens.map((t) => t.fcmToken)
    };
    try {
      await admin.messaging().sendEachForMulticast(message);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async createNotification(noti: NofiticationDto) {
    return await this.db.notification.create(noti)
  }
}