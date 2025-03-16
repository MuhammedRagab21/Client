export const emailTemplates = {
  welcome: () => ({
    subject: "Welcome to Social Media Empire!",
    html: `
      <h1>Welcome to Social Media Empire!</h1>
      <p>Thanks for joining our community. We're excited to help you build your faceless social media empire.</p>
      <p>Here are some resources to get you started:</p>
      <ul>
        <li><a href="#">Faceless Mastery Playbook</a></li>
        <li><a href="#">Master Sales Funnel</a></li>
        <li><a href="#">Master Reels</a></li>
      </ul>
    `,
  }),
  abandoned: () => ({
    subject: "Complete Your Social Media Empire Bundle!",
    html: `
      <h1>You left something behind!</h1>
      <p>It looks like you started an order but didn't finish it. Don't miss out on the Social Media Empire Blueprint Bundle!</p>
      <p>Click here to complete your purchase: <a href="#">Complete My Order</a></p>
    `,
  }),
}

export const sendEmail = async (email: string, template: { subject: string; html: string }) => {
  // In a real application, you would use a service like SendGrid, Mailgun, or MailerLite to send emails
  // For this demo, we'll just log the email to the console
  console.log(`Sending email to ${email} with subject: ${template.subject}`)
  console.log("Email content:", template.html)

  // Simulate success
  return {
    success: true,
    message: "Email sent successfully",
  }
}

