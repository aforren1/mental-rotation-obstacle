const API_KEY = process.env.MAILGUN_API_KEY
const DOMAIN = process.env.MAILGUN_DOMAIN
const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN })

function sendMailgun(buf2, data_in, callback) {
  let buf = new Buffer.from(buf2, 'utf8')

  let id = data_in['config']['id']
  let correct = 0
  let len = data_in['data'].real.length
  for (let i = 0; i < len; i++) {
    correct += data_in['data'].real[i].correct
  }

  var attach = new mailgun.Attachment({
    data: buf,
    filename: `data_${id}.json`,
    contentType: 'application/json',
    knownLength: buf.length,
  })

  let data = {
    from: "Alex 'Mailgun' Forrence <mailgun@" + DOMAIN + '>',
    to: 'actlab@yale.edu',
    subject: `Fresh data from ${id} for [mirror]`,
    text: `See attached. Got ${correct} / ${len} correct.`,
    attachment: attach,
  }

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      callback(null, {
        statusCode: error.statusCode,
      })
    } else {
      callback(null, {
        statusCode: 200,
      })
    }
  })
}

exports.handler = function (event, context, callback) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  const data_in = JSON.parse(event.body)

  sendMailgun(event.body, data_in, callback)
}
