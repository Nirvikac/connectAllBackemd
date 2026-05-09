import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: { type: String, required: true },
  connectedAccounts: [
    {
      platform: {
        type: String,
        enum: ["whatsapp", "facebook", "instagram", "tiktok"],
      },
      accessToken: String,
      refreshToken: String,
      accountId: String,
      meta: Object,
    },
  ],
});

export type UserSchema = InferSchemaType<typeof userSchema>;

const User = mongoose.model<UserSchema>("User", userSchema);
export default User;
