const
    express = require('express'),
    simpleOauth2 = require('simple-oauth2'),
    {env} = process

const oauth2 = simpleOauth2.create({
    client: {
        id: env.CLIENT_ID,
        secret: env.CLIENT_SECRET,
    },
    auth: {
        tokenHost: env.OAUTH_HOST,
        authorizePath: env.AUTH_PATH,
        tokenPath: env.TOKEN_PATH,
    },
})

const app = express()

app.get('/', (req, res) => {
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri: env.CALLBACK_URL,
        scope: env.SCOPE.split(','),
        state: 'qzhoeinfgthlkpmpbwqzdswq', // should be randomly generated
    })

    res.send(`<a href="${authorizationUri}">Click me</a>`)
})

app.get('/callback', async (req, res) => {
    const
        {code, error} = req.query,
        redirect_uri = env.CALLBACK_URL

    try {
        if (error)
            throw error

        const result =
            await oauth2.authorizationCode.getToken({code, redirect_uri})

        const token = oauth2.accessToken.create(result)

        return res.send(token.token.access_token)
    } catch (e) {
        return res.status(500).send('Error: ' + e)
    }
})

app.listen(env.PORT, err => {
    if (err)
        return console.error(err)
})
