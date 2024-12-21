import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    private config: ConfigService
  ) {
    v2.config({
      cloud_name: config.get('storage.cloudinary.cloudName'),
      api_key: config.get('storage.cloudinary.apikey'),
      api_secret: config.get('storage.cloudinary.apiSecretKey'),
    })
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      v2.uploader.upload_stream((error, result: UploadApiResponse) => {
        if (error) return reject(error);
        resolve(result.secure_url); // URL của file sau khi upload
      }).end(file.buffer)
    });
  }
}