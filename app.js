const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp= require('express-graphql')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/schema/index')
const graphqlResolvers = require('./graphql/resolvers/index')

const app = express()
app.use(bodyParser.json())  // Json body parser middleware.

// GraphQL endpoint.
app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true // Enable graphiql front end for development.
}))

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@project0-trdi4.azure.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
).then(() => {
  app.listen(3000)
})
.then().catch((err) => {
  console.log(err)
})
