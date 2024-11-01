import * as process from "process";

export const configuration = () => ({
  db: {
    uri: process.env.MONGO_URI
  },
  storage: {
    s3: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucketName: process.env.S3_BUCKET_NAME
    }
  },
  auth: {
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET
    },
    ignoreMailVerification: process.env.IGNORE_EMAIL_VERIFICATION === "1" || process.env.IGNORE_EMAIL_VERIFICATION === "true"
  },
  webDomain: process.env.WEB_DOMAIN,
  mail: {
    mailgunKey: process.env.MAIL_KEY,
    domain: process.env.MAIL_DOMAIN
  }
});
