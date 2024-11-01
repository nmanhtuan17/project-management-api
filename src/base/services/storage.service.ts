import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import axios from "axios";
import { HydratedDocument } from "mongoose";
import { DbService } from "../db/services/db.service";
import { randomString } from "@/common/utils";
import { ProjectAttachment, ProjectAttachmentWithDownloadUrl, Task } from "../db";

@Injectable()
export class StorageService {
  s3: AWS.S3;
  s3Bucket: string;

  constructor(
    private config: ConfigService,
    private db: DbService
  ) {
    this.s3 = new AWS.S3({
      credentials: {
        accessKeyId: this.config.get("storage.s3.accessKeyId"),
        secretAccessKey: this.config.get("storage.s3.secretAccessKey")
      }
    });
    this.s3Bucket = this.config.get("storage.s3.bucketName");
  }

  async deleteFile(fileKey: string) {
    return this.s3.deleteObject({
      Bucket: this.s3Bucket,
      Key: fileKey
    }).promise();
  }

  async uploadAttachmentFile(spaceId: string, memberId: string, file: Express.Multer.File) {
    const timestamp = new Date().getTime();
    return await this.s3.upload({
      Bucket: this.s3Bucket,
      Key: `spaces/${spaceId}/${memberId}/${timestamp}_${file.originalname}`,
      Body: file.buffer,
      ACL: "private",
      ContentType: file.mimetype,
      ContentDisposition: "inline"
    }).promise();
  }

  async uploadEmailAttachment(contentType: string, fileName: string, cid: string, size: number, attachmentUrl: string) {
    const response = await axios.get(attachmentUrl, {
      responseType: "arraybuffer",
      auth: {
        username: "api",
        password: this.config.get("mail.mailgunKey")
      }
    });
    const buffer = Buffer.from(response.data, "binary");
    const storageKey = `emails/attachments/${cid}_${randomString(10)}_${fileName}`;
    const newUpload = await this.s3.upload({
      Bucket: this.s3Bucket,
      Key: storageKey,
      Body: buffer,
      ACL: "private",
      ContentType: contentType
    }).promise();

    return this.db.emailAttachment.create({
      contentType,
      name: fileName,
      url: newUpload.Location,
      size,
      cid,
      storageKey
    });
  }

  async uploadEmailAttachmentBuffer(contentType: string, fileName: string, cid: string, size: number, attachment: Buffer) {
    const storageKey = `emails/attachments/${cid}_${randomString(10)}_${fileName}`;
    const newUpload = await this.s3.upload({
      Bucket: this.s3Bucket,
      Key: storageKey,
      Body: attachment,
      ACL: "private",
      ContentType: contentType
    }).promise();

    return this.db.emailAttachment.create({
      contentType,
      name: fileName,
      url: newUpload.Location,
      size,
      cid,
      storageKey
    });
  }

  async getSignedUrl(key: string, expiration = 3600) {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.s3Bucket,
      Key: key,
      Expires: expiration
    });
  }

  async uploadProjectCoverFile(file: Express.Multer.File, fileName: string) {
    const processedImage = await sharp(file.buffer)
      .resize(1640, 856, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
      })
      .jpeg({
        quality: 80
      }).toBuffer();
    return await this.s3.upload({
      Bucket: this.s3Bucket,
      Key: `project-covers/${fileName}`,
      Body: processedImage,
      ACL: "public-read",
      ContentType: file.mimetype,
      ContentDisposition: "inline"
    }).promise();
  }

  async uploadAvatarFile(file: Express.Multer.File, fileName: string) {
    const processedImage = await sharp(file.buffer)
      .resize(256, 256, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
      }).jpeg({
        quality: 80
      })
      .toBuffer();
    return await this.s3.upload({
      Bucket: this.s3Bucket,
      Key: `avatars/${fileName}`,
      Body: processedImage,
      ACL: "public-read",
      ContentType: file.mimetype,
      ContentDisposition: "inline"
    }).promise();
  }

  async getSignedTaskAttachments(task: HydratedDocument<Task>) {
    let mappedAttachments: ProjectAttachmentWithDownloadUrl[] = [];
    for (let attachment of (task.attachments || []) as HydratedDocument<ProjectAttachment>[]) {
      const url = await this.getSignedUrl(attachment.storeKey);
      const withDownloadUrl: ProjectAttachmentWithDownloadUrl = {
        ...attachment.toJSON(),
        url
      };
      mappedAttachments.push(withDownloadUrl);
    }
    return mappedAttachments;
  }
}
