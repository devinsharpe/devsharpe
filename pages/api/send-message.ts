// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

type Body = {
  name: string;
  email: string;
  message: string;
};

type Data = { id: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const body = req.body as Body;
    const mailer = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const info = await mailer.sendMail({
      from: `"${body.name}" <${body.email}>`,
      to: process.env.EMAIL_ADDRESS,
      subject: "Message from Portfolio",
      text: body.message
    });
    res.status(200).json({ id: info.messageId });
  } else {
    res.status(405).end();
  }
}
