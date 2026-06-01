import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RegisterForm = {
  fullName: string;
  email: string;
  organization: string;
  reason: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

function validate(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.organization.trim()) errors.organization = 'Organization is required.';
  if (form.reason.trim().length < 10) {
    errors.reason = 'Please provide a short reason (at least 10 characters).';
  }

  return errors;
}

function asForm(value: unknown): RegisterForm {
  const input = (value ?? {}) as Partial<RegisterForm>;

  return {
    fullName: typeof input.fullName === 'string' ? input.fullName : '',
    email: typeof input.email === 'string' ? input.email : '',
    organization: typeof input.organization === 'string' ? input.organization : '',
    reason: typeof input.reason === 'string' ? input.reason : '',
  };
}

function missingEnvVars() {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'] as const;

  return requiredEnvVars.filter((key) => !process.env[key]);
}

export async function POST(request: Request) {
  try {
    const form = asForm(await request.json());
    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          message: 'Please fix the highlighted fields.',
          errors,
        },
        { status: 400 }
      );
    }

    const missing = missingEnvVars();
    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required email configuration: ${missing.join(', ')}`,
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `BLS calendar access request - ${form.organization}`;
    const text = [
      'A new BLS calendar access request was submitted.',
      '',
      `Full name: ${form.fullName}`,
      `Email: ${form.email}`,
      `Organization: ${form.organization}`,
      '',
      'Reason:',
      form.reason,
    ].join('\n');

    const html = `
      <p>A new <strong>BLS calendar access request</strong> was submitted.</p>
      <ul>
        <li><strong>Full name:</strong> ${form.fullName}</li>
        <li><strong>Email:</strong> ${form.email}</li>
        <li><strong>Organization:</strong> ${form.organization}</li>
      </ul>
      <p><strong>Reason</strong></p>
      <p>${form.reason.replace(/\n/g, '<br />')}</p>
    `;

    await transporter.sendMail({
      to: process.env.ADMIN_EMAIL,
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      replyTo: form.email,
      subject,
      text,
      html,
    });

    return NextResponse.json({
      message: 'Request sent successfully.',
    });
  } catch (error) {
    console.error('request-calendar-access error', error);
    return NextResponse.json(
      {
        message: 'Unable to submit request right now. Please try again later.',
      },
      { status: 500 }
    );
  }
}

