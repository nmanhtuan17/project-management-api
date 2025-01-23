import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import axios from "axios";
import { HydratedDocument } from "mongoose";
import { DbService } from "../db/services/db.service";
import { randomString } from "@/common/utils";
import { ProjectAttachment, ProjectAttachmentWithDownloadUrl, Task } from "../db";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

@Injectable()
export class StorageService {
  s3: S3Client;
  s3Bucket: string;
  s3Region: string;

  constructor(
    private config: ConfigService,
    private db: DbService
  ) {
    this.s3 = new S3Client({
      region: this.config.get("storage.s3.region"),
      credentials: {
        accessKeyId: this.config.get("storage.s3.accessKeyId"),
        secretAccessKey: this.config.get("storage.s3.secretAccessKey")
      }
    });
    this.s3Bucket = this.config.get("storage.s3.bucketName");
    this.s3Region = this.config.get("storage.s3.region")
  }

  async deleteFile(bucket: string, key: string) {
    return this.s3.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    }))
  }

  async uploadAttachmentFile(projectId: string, file: Express.Multer.File) {
    const timestamp = new Date().getTime();
    const key = `projects/${projectId}/${timestamp}_${file.originalname}`
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.mimetype
      }))
    return { url: `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}` }
  }

  async uploadEmailAttachment(file: Express.Multer.File, messageID: string) {
    const storageKey = `emails/attachments/${messageID}_${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: storageKey,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.mimetype
      }))

    return await this.db.emailAttachment.create({
      contentType: file.mimetype,
      name: file.originalname,
      url: `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${storageKey}`,
      size: file.size,
      messageID,
      storageKey
    });
  }

  // async uploadEmailAttachmentBuffer(contentType: string, fileName: string, cid: string, size: number, attachment: Buffer) {
  //   const storageKey = `emails/attachments/${cid}_${randomString(10)}_${fileName}`;
  //   const newUpload = await this.s3.upload({
  //     Bucket: this.s3Bucket,
  //     Key: storageKey,
  //     Body: attachment,
  //     ACL: "private",
  //     ContentType: contentType
  //   }).promise();

  //   return this.db.emailAttachment.create({
  //     contentType,
  //     name: fileName,
  //     url: newUpload.Location,
  //     size,
  //     cid,
  //     storageKey
  //   });
  // }

  // async uploadProjectCoverFile(file: Express.Multer.File, fileName: string) {
  //   const processedImage = await sharp(file.buffer)
  //     .resize(1640, 856, {
  //       fit: sharp.fit.cover,
  //       position: sharp.strategy.entropy
  //     })
  //     .jpeg({
  //       quality: 80
  //     }).toBuffer();
  //   return await this.s3.upload({
  //     Bucket: this.s3Bucket,
  //     Key: `project-covers/${fileName}`,
  //     Body: processedImage,
  //     ACL: "public-read",
  //     ContentType: file.mimetype,
  //     ContentDisposition: "inline"
  //   }).promise();
  // }

  // async uploadAvatarFile(file: Express.Multer.File, fileName: string) {
  //   const processedImage = await sharp(file.buffer)
  //     .resize(256, 256, {
  //       fit: sharp.fit.cover,
  //       position: sharp.strategy.entropy
  //     }).jpeg({
  //       quality: 80
  //     })
  //     .toBuffer();
  //   return await this.s3.upload({
  //     Bucket: this.s3Bucket,
  //     Key: `avatars/${fileName}`,
  //     Body: processedImage,
  //     ACL: "public-read",
  //     ContentType: file.mimetype,
  //     ContentDisposition: "inline"
  //   }).promise();
  // }

  async getSignedTaskAttachments(task: HydratedDocument<Task>) {
    let mappedAttachments: ProjectAttachmentWithDownloadUrl[] = [];
    // for (let attachment of (task.attachments || []) as HydratedDocument<ProjectAttachment>[]) {
    //   const url = await this.getSignedUrl(attachment.storeKey);
    //   const withDownloadUrl: ProjectAttachmentWithDownloadUrl = {
    //     ...attachment.toJSON(),
    //     url
    //   };
    //   mappedAttachments.push(withDownloadUrl);
    // }
    return mappedAttachments;
  }
}
