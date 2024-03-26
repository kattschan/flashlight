import { login } from 'studentvue.js'
import * as cookie from 'cookie'

export async function GET({ locals }) {
	console.log('get data')

	let result

	try {
		let client = await login(
			Buffer.from(locals.user.districtUrl, 'base64').toString('ascii'),
			Buffer.from(locals.user.username, 'base64').toString('ascii'),
			Buffer.from(locals.user.password, 'base64').toString('ascii')
		)
		console.log(JSON.parse(await client.getStudentInfo()).StudentInfo)
		// let gradebook = JSON.parse(await client.getGradebook()).Gradebook
		result = await Promise.all([
			client.getStudentInfo().then((value) => JSON.parse(value).StudentInfo),
			client.getGradebook().then((value) => JSON.parse(value).Gradebook),
		])

		if (!result[0]) {
			throw new Error('No data returned')
		}
	} catch (error) {
		console.log(error)
		return new Response(null, {
			status: 401,
			headers: {
				'Set-cookie': cookie.serialize('auth', '', {
					httpOnly: true,
					sameSite: 'strict',
					path: '/',
					expires: new Date(0)
				})
			}
		})
	}

	console.log('logged in')

	const currentPeriod = 0;
		console.log(result)
	return new Response(
		JSON.stringify({
			student: result.shift(),
			periods: result,
			currentPeriod
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)
	console.log(student)
}
