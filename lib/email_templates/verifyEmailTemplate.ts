import { templateThemeParams, verifyEmailTemplateParams } from "@/types";

export const verifyEmailTemplate = ({
	email,
	verificationLink,
	backgroundColor,
	titleTextColor,
	linkColor,
}: verifyEmailTemplateParams & templateThemeParams) => {
	const bgColor = backgroundColor || "#4CAF50";
	const color = {
		background: "#f4f4f4",
		mainBackground: "#ffffff",
		text: "#333333",
		buttonBackground: bgColor,
		buttonBorder: bgColor,
		headingTextColor: titleTextColor || "#fff",
		linkColor: linkColor || "blue",
	};

	return `
<body style="font-family: Arial, sans-serif; background-color: ${color.background}; margin: 0; padding: 0;">
  <div style="width: 100%; padding: 20px; background-color: ${color.background};">
    <div style="background-color: ${color.mainBackground}; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px; background-color: ${color.buttonBackground}; color: ${color.headingTextColor}; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <h1 style="margin: 0; font-size: 24px;">Verify Your Email Address</h1>
      </div>
      <div style="padding: 20px; text-align: center; color: ${color.text};">
        <p style="font-size: 16px; line-height: 1.5;">Hello <span style="font-weight:bold;">${email}</span>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with us! Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" target="_blank" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: ${color.buttonBackground}; color: ${color.headingTextColor}; text-decoration: none; font-size: 16px; border-radius: 5px; border: 1px solid ${color.buttonBorder};">Verify Email</a>
        <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">If the button above doesn’t work, copy and paste the following link into your web browser:</p>
        <p style="font-size: 16px; line-height: 1.5; word-wrap: break-word; color: ${color.linkColor};">${verificationLink}</p>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #888888;">
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>&copy; 2024 authjs-app. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>`;
};
