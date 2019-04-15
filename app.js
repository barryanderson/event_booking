const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp= require('express-graphql')
const { buildSchema } = require('graphql')

const events = [] // Temp for development.

const app = express()
app.use(bodyParser.json())  // Json body parser middleware.

// GraphQL endpoint.
app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    // Resolvers.
    events: () => {
      return events
    },
    createEvent: (args) => {
      const event = {
        _id: Math.random().toString(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: args.eventInput.date // new Date().toISOString()
      }

      events.push(event)
      return event
    }
  },
  graphiql: true // Enable graphiql front end for development.
}))

app.listen(3000)
