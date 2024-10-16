import * as process from "process";

export const configuration = () => ({
  db: {
    uri: process.env.MONGO_URI
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET
    },
    ignoreMailVerification: process.env.IGNORE_EMAIL_VERIFICATION === "1" || process.env.IGNORE_EMAIL_VERIFICATION === "true"
  },
});
