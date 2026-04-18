import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/models/prisma';
import { sendMail } from '@/lib/email';

/**
 * @swagger
 * tags:
 *   - name: Contact
 *     description: Endpoint for submitting contact messages
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact message
 *     tags:
 *       - Contact
 *     description: Accepts name, email, and message from a contact form and saves it in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               message:
 *                 type: string
 *                 example: "I would like more information about your services."
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the saved contact message
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All fields are required"
 *       415:
 *         description: Invalid content type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid content type"
 *       500:
 *         description: Internal server error while saving the message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to submit message"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */


export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 415 });
    }

    const body = await request.json();
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const message = (body.message || '').toString().trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    // send notification email if SMTP is configured
    try {
      await sendMail({
        to: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER || '',
        subject: `New contact form submission from ${name}`,
        html: `<p>${message.replace(/\n/g, '<br/>')}</p><p>From: ${name} &lt;${email}&gt;</p>`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
      });
    } catch (mailErr) {
      console.error('Failed to send contact notification', mailErr);
      // don't fail the request just because email failed
    }

    return NextResponse.json({ success: true, data: { id: saved.id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit message', details: error?.message }, { status: 500 });
  }
}


