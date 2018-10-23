'use strict';
import { Transporter, createTransport } from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { IMailerSendArgs } from '../interfaces/services';

class Mailer {
  private transporter: Transporter;

  constructor() {
    const host: string = process.env.MAIL_HOST || '127.0.0.0';
    const port: number = parseInt(process.env.MAIL_PORT || '1025', 10);

    const smtpConfig: smtpTransport.SmtpOptions = {
      host,
      port,
      secure: false,
      ignoreTLS: true,
      connectionTimeout: 60000,
    };

    this.transporter = createTransport(smtpTransport(smtpConfig));
  }

  public send = (args: IMailerSendArgs): Promise<void> => new Promise(
    (resolve, reject) => {
      const emailBody: { [key: string]: string } = {
        plain: args.body.plain,
        html: args.body.html,
      };
      const emailBodyKeys = Object.getOwnPropertyNames(emailBody);
      args.body.keywordReplacements.forEach(replacement => {
        emailBodyKeys.forEach(key => {
          emailBody[key] = emailBody[key].replace(
            new RegExp(replacement.find, 'g'),
            replacement.replace
          );
        });
      });

      const message = {
        from: {
          name: args.from.name,
          address: args.from.address,
        },
        to: args.to,
        subject: args.subject,
        text: emailBody.plain,
        html: `<html><head></head><body>${emailBody.html}</body><html>`,
      };

      this.transporter.sendMail(message, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }
  )
}

const mailer = new Mailer();
export default mailer;