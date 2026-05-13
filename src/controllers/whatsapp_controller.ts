import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import User from "../models/user.model";
dotenv.config();

export const connectWhatsApp = async (req: Request, res: Response) => {
  // This endpoint is called after the user authorizes the app on Facebook and Facebook redirects back with a code
  const { code } = req.body;
  // In a real app, you should verify the code and handle errors properly
  const userId = res.locals.user?.id;
  // Exchange the code for an access token
  const tokenRes = await axios.get(
    `https://graph.facebook.com/v20.0/oauth/access_token`,
    {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri:
          "https://connectallbackemd.onrender.com/api/whatsapp/callback",

        code,
      },
    },
  );
  // In a real app, you should check if the token exchange was successful and handle errors
  const accessToken = tokenRes.data.access_token;

  // Get the phone number ID associated with the WhatsApp Business Account
  const phoneNumbersRes = await axios.get(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  // In a real app, you should check if the request was successful and handle errors
  // Assuming the user has only one phone number, we take the first one. In a real app, you should handle multiple phone numbers properly.
  const phoneNumberId = phoneNumbersRes.data.data?.[0]?.id;
  if (!phoneNumberId) {
    return res.status(400).json({
      message: "No valid phone number found for the WhatsApp Business Account",
      success: false,
    });
  }
  // Save the access token and phone number ID to the user's record in the database
  await User.findByIdAndUpdate(userId, {
    whatsapp: {
      accessToken,
      phoneNumberId,
    },
  });
  try {
    // Return a success response
    return res.json({
      message: "WhatsApp connected successfully",
      success: true,
    });
  } catch (error) {
    return res.json({
      message: "Failed to connect WhatsApp",
      success: false,
    });
  }
};
