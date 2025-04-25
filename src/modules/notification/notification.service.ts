import { Messages } from "@/base/config";
import { DbService } from "@/base/db/services";
import { NofiticationDto } from "@/modules/notification/dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
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

  async registerToken(token: string, sessionId: string) {
    const session = await this.db.session.getById(sessionId)
    session.fcmToken = token
    await session.save()
    return {
      message: 'Register token success'
    }
  }

  async sendNotification(userId: string, notification: { title: string, body: string }) {
    const sessions = await this.db.session.find({
      user: userId,
      fcmToken: { $exists: true, $ne: null }
    });

    if (!sessions.length) return;
    
    const validSessions = sessions.filter(session =>
      new Date() <= session.expirationDate
    );

    if (!validSessions.length) return;

    const message = {
      notification: notification,
      tokens: validSessions.map(session => session.fcmToken)
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Notifications sent successfully:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async createNotification(noti: NofiticationDto) {
    return await this.db.notification.create(noti)
  }
}