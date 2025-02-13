import { storage } from "../storage";
import { InsertReport } from "@shared/schema";

class WhatsAppService {
  private apiToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;

  constructor() {
    // Using placeholder values - to be replaced with actual credentials
    this.apiToken = process.env.WHATSAPP_API_TOKEN || "placeholder_token";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "placeholder_phone_id";
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "placeholder_account_id";
  }

  // Anonymize sensitive information from the message
  private anonymizeMessage(message: string): string {
    // Replace phone numbers
    message = message.replace(/\+?\d{10,}/g, '[PHONE_REDACTED]');
    
    // Replace email addresses
    message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    
    // Replace names (basic implementation, can be enhanced)
    message = message.replace(/Mr\.\s+\w+|Mrs\.\s+\w+|Ms\.\s+\w+/g, '[NAME_REDACTED]');
    
    return message;
  }

  // Handle incoming WhatsApp message
  async handleIncomingMessage(from: string, message: string) {
    try {
      // Anonymize the message
      const anonymizedMessage = this.anonymizeMessage(message);

      // Create a report from the message
      const report: InsertReport = {
        title: "WhatsApp Report",
        description: anonymizedMessage,
        category: "Other", // Default category
        location: "Submitted via WhatsApp",
      };

      // Store the report
      const savedReport = await storage.createReport(report);

      // Send confirmation back to the user
      await this.sendMessage(
        from,
        `Thank you for your report. Your tracking token is: ${savedReport.anonymousToken}\n\n` +
        `You can use this token to track the status of your report on our website.`
      );

      return savedReport;
    } catch (error) {
      console.error('Error handling WhatsApp message:', error);
      throw error;
    }
  }

  // Send message back to user
  async sendMessage(to: string, message: string) {
    try {
      // Placeholder for actual WhatsApp API call
      console.log(`[WhatsApp Placeholder] Sending message to ${to}: ${message}`);
      
      // In production, this would be replaced with actual WhatsApp API call:
      /*
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: message }
          }),
        }
      );
      */
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  // Send status update to user
  async sendStatusUpdate(phoneNumber: string, reportId: string, newStatus: string) {
    const message = `Update on your report: The status has been changed to ${newStatus}.`;
    return this.sendMessage(phoneNumber, message);
  }
}

export const whatsappService = new WhatsAppService();
