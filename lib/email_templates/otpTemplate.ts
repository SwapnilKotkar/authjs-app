import { otpTemplateParams, templateThemeParams } from "@/types";

export const otpTemplate = ({
	email,
	otp,
	backgroundColor,
	titleTextColor,
}: otpTemplateParams & templateThemeParams) => {
	const bgColor = backgroundColor || "#007BFF";
	const color = {
		background: "#f4f4f4",
		mainBackground: "#ffffff",
		text: "#333333",
		buttonBackground: bgColor,
		headingTextColor: titleTextColor || "#fff",
	};

	return `
<body style="font-family: Arial, sans-serif; background-color: ${color.background}; margin: 0; padding: 0;">
  <div style="width: 100%; padding: 20px; background-color: ${color.background};">
    <div style="background-color: ${color.mainBackground}; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px; background-color: ${color.buttonBackground}; color: ${color.headingTextColor}; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <h1 style="margin: 0; font-size: 24px;">Your OTP Code</h1>
      </div>
      <div style="padding: 20px; text-align: center; color: ${color.text};">
        <p style="font-size: 16px; line-height: 1.5;">Hello <span style="font-weight:bold;">${email}</span>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Your One-Time Password (OTP) for verification is:</p>
        <p style="font-size: 24px; font-weight: bold; margin: 20px 0; color: ${color.buttonBackground};">${otp}</p>
        <p style="font-size: 16px; line-height: 1.5;">This OTP is valid for the next 10 minutes. Please use it to complete your verification process.</p>
        <p style="font-size: 16px; line-height: 1.5;">If you did not request this OTP, please ignore this email.</p>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #888888;">
        <p>&copy; 2024 authjs-app. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>`;
};
