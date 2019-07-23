import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { createTransport } from 'nodemailer'
import { render } from 'nunjucks'
import { join } from 'path'

import Setting from './Setting'

const firestore = admin.firestore()
const config: { email: string, password: string } = functions.config().gmail
const transport = createTransport({
	service: 'gmail',
	auth: {
		user: config.email,
		pass: config.password
	}
})

export enum EmailType {
	accessRemoved = 'access-removed',
	inviteConfirmed = 'invite-confirmed',
	invited = 'invited',
	roleChanged = 'role-changed',
	uninvited = 'uninvited',
	youConfirmedInvite = 'you-confirmed-invite'
}

export default class Email {
	static send(type: EmailType, { to, subject }: { to: string, subject: string }, context?: object): Promise<boolean> {
		return Email.sendEmail(to, subject, render(join(__dirname, `../emails/${type.valueOf()}.html`), context))
	}

	static sendEmail(to: string, subject: string, body: string): Promise<boolean> {
		return Setting.get<boolean>('email-notifications', to).then(value =>
			value
				? firestore.doc(`users/${to}`).get().then(user => {
					const email: string | undefined = user.get('email')
					return email
						? transport.sendMail({
							from: config.email,
							to: email,
							subject,
							text: body
						}).then(() => true).catch(() => false)
						: false
				})
				: false
		)
	}
}