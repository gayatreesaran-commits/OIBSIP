import { describe, expect, it, vi } from 'vitest';
import mailConfig from '../../config/mail.config.js';
import { ERROR_CODE } from '../../src/constants/index.js';
import { createEmailProvider } from '../../src/providers/email/index.js';

const logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() };
const message = { to: 'guest@example.test', subject: 'Hello', html: '<p>Hi</p>', text: 'Hi' };

function fakeMailer({ sendMail = vi.fn().mockResolvedValue({ messageId: 'm-1' }) } = {}) {
  const transport = { sendMail };
  return {
    transport,
    createTransport: vi.fn().mockReturnValue(transport),
    createTestAccount: vi.fn().mockResolvedValue({
      user: 'ethereal.user@ethereal.email',
      pass: 'pw',
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    }),
    getTestMessageUrl: vi.fn().mockReturnValue('https://ethereal.email/message/abc'),
  };
}

describe('ethereal email provider', () => {
  it('creates one test account, reuses it, and returns a preview url', async () => {
    const mailer = fakeMailer();
    const provider = createEmailProvider({
      env: { EMAIL_PROVIDER: 'ethereal' },
      mailConfig,
      logger,
      mailer,
    });

    const first = await provider.sendMail(message);
    await provider.sendMail(message);

    expect(mailer.createTestAccount).toHaveBeenCalledTimes(1);
    expect(first.previewUrl).toBe('https://ethereal.email/message/abc');
    expect(mailer.transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: `"${mailConfig.fromName}" <ethereal.user@ethereal.email>`,
        to: message.to,
      }),
    );
  });

  it('wraps transport failures in a typed upstream error', async () => {
    const mailer = fakeMailer({ sendMail: vi.fn().mockRejectedValue(new Error('smtp down')) });
    const provider = createEmailProvider({
      env: { EMAIL_PROVIDER: 'ethereal' },
      mailConfig,
      logger,
      mailer,
    });
    await expect(provider.sendMail(message)).rejects.toMatchObject({
      code: ERROR_CODE.EMAIL_DELIVERY_FAILED,
    });
  });
});

describe('smtp email provider', () => {
  const env = {
    EMAIL_PROVIDER: 'smtp',
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: 465,
    SMTP_SECURE: true,
    SMTP_USER: 'mailer',
    SMTP_PASS: 'secret',
    EMAIL_FROM_ADDRESS: 'orders@example.test',
  };

  it('builds its transport from env and timeouts from config', async () => {
    const mailer = fakeMailer();
    createEmailProvider({ env, mailConfig, logger, mailer });
    expect(mailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.test',
        port: 465,
        secure: true,
        auth: { user: 'mailer', pass: 'secret' },
        connectionTimeout: mailConfig.transport.connectionTimeoutMs,
      }),
    );
  });

  it('sends from the configured address without a preview url', async () => {
    const mailer = fakeMailer();
    const provider = createEmailProvider({ env, mailConfig, logger, mailer });
    const result = await provider.sendMail(message);
    expect(result).toEqual({ messageId: 'm-1', previewUrl: undefined });
    expect(mailer.transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: `"${mailConfig.fromName}" <orders@example.test>` }),
    );
  });
});

describe('createEmailProvider', () => {
  it('rejects an unknown provider name', () => {
    expect(() =>
      createEmailProvider({ env: { EMAIL_PROVIDER: 'carrier-pigeon' }, mailConfig, logger }),
    ).toThrow(/Unsupported EMAIL_PROVIDER/);
  });
});
