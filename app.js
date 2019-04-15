const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp= require('express-graphql')
const { buildSchema } = require('graphql')

const app = express()
app.use(bodyParser.json())  // Json body parser middleware.

// GraphQL endpoint.
app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type RootQuery {
      events: [String!]!
    }

    type RootMutation {
      createEvent(name: String): String
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    // Resolvers.
    events: () => {
      return ['JS Club', 'All night party', 'Cooking 101']
    },
    createEvent: (args) => {
      const eventName = args.name
      return eventName
    }
  },
  graphiql: true // Enable graphiql front end for development.
}))

app.listen(3000)
