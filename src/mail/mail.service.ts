// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Service dédié à l'envoi d'emails.
 * Permet de centraliser la configuration SMTP et la logique d'envoi.
 */
@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true si port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envoie un email générique
   * @param to Destinataire
   * @param subject Sujet de l'email
   * @param html Contenu HTML de l'email
   */
  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"Support SNCF" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }

  /**
   * Envoie un email spécifique pour la réinitialisation du mot de passe
   * @param to Email de l'utilisateur
   * @param resetLink Lien complet de réinitialisation
   */
  async sendResetPasswordEmail(to: string, resetLink: string) {
    const html = `
      <p>Bonjour,</p>
      <br/>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>

      <a href="${resetLink}">${resetLink}</a>
      <br/>
      <p>Ce lien expire dans 2 heures.</p>
        <br/>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <br/>
      <p>Cordialement,<br/>L'équipe SNCF FMLP PACA</p>
    `;
    await this.sendMail(to, 'Réinitialisation de votre mot de passe', html);
  }
}
