const RESEND_API_KEY    = process.env.RESEND_API_KEY;
const HAIRDRESSER_EMAIL = process.env.HAIRDRESSER_EMAIL;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { customerName, customerEmail, service, date, time, price, phone, ref } = await req.json();

  // ── Confirmation email to customer ────────────────────
  const customerHtml = `
    <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;background:#0f0f0f;color:#f0ead6;padding:40px;">
      <h1 style="font-size:22px;color:#C9A84C;font-weight:300;letter-spacing:4px;margin-bottom:4px;">DIOR STUDIO</h1>
      <p style="font-size:10px;color:#9a8860;letter-spacing:3px;text-transform:uppercase;margin-bottom:36px;">Booking Confirmation</p>
      <p style="font-size:14px;color:#f0ead6;margin-bottom:12px;">Dear ${customerName},</p>
      <p style="font-size:13px;color:#9a8860;line-height:1.8;margin-bottom:36px;">
        Your appointment has been confirmed. We look forward to welcoming you to Dior Studio.
      </p>
      <table style="width:100%;border-collapse:collapse;border-top:0.5px solid #2a2a2a;">
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Service</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${service}</td>
        </tr>
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Date</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${date}</td>
        </tr>
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Time</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${time}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Price</td>
          <td style="padding:10px 0;font-size:15px;color:#C9A84C;text-align:right;">${price}</td>
        </tr>
      </table>
      <p style="font-size:10px;color:#5a4e38;margin-top:32px;letter-spacing:1px;text-transform:uppercase;">Ref: ${ref}</p>
      <p style="font-size:11px;color:#5a4e38;margin-top:8px;line-height:1.6;">
        To cancel or reschedule, please contact us directly.
      </p>
    </div>
  `;

  // ── New booking alert to hairdresser ──────────────────
  const hairdresserHtml = `
    <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;background:#0f0f0f;color:#f0ead6;padding:40px;">
      <h1 style="font-size:22px;color:#C9A84C;font-weight:300;letter-spacing:4px;margin-bottom:4px;">NEW BOOKING</h1>
      <p style="font-size:10px;color:#9a8860;letter-spacing:3px;text-transform:uppercase;margin-bottom:36px;">Dior Studio</p>
      <table style="width:100%;border-collapse:collapse;border-top:0.5px solid #2a2a2a;">
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Client</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${customerName}</td>
        </tr>
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Phone</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${phone}</td>
        </tr>
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Service</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${service}</td>
        </tr>
        <tr style="border-bottom:0.5px solid #1a1a1a;">
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Date</td>
          <td style="padding:10px 0;font-size:13px;color:#f0ead6;text-align:right;">${date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:10px;color:#9a8860;letter-spacing:1px;text-transform:uppercase;">Time</td>
          <td style="padding:10px 0;font-size:15px;color:#C9A84C;text-align:right;">${time}</td>
        </tr>
      </table>
      <p style="font-size:10px;color:#5a4e38;margin-top:32px;letter-spacing:1px;text-transform:uppercase;">Ref: ${ref}</p>
    </div>
  `;

  try {
    const sends = [];

    // Send to customer only if they provided an email
    if (customerEmail) {
      sends.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Dior Studio <onboarding@resend.dev>',
            to: [customerEmail],
            subject: `Booking Confirmed — ${service} on ${date}`,
            html: customerHtml
          })
        })
      );
    }

    // Always send to hairdresser
    sends.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Dior Studio <onboarding@resend.dev>',
          to: [HAIRDRESSER_EMAIL],
          subject: `New Booking — ${customerName}, ${service} at ${time} on ${date}`,
          html: hairdresserHtml
        })
      })
    );

    await Promise.all(sends);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Email error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/send-email' };
