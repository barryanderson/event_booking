const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp= require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

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

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    // Resolvers.
    events: () => {
      return Event.find()
        .then((events) => {
          return events.map(event => {
            return { ...event._doc, _id: event.id }
          })
        }).catch((err) => {
          console.log(err)
          throw err
        })
    },
    createEvent: (args) => {
      let createdEvent = undefined

      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5cb49e82841d603afe8639b3'  // Hard coded user for now.
      })
      return event
        .save()
        .then((result) => {
          createdEvent = { ...result._doc, _id: event.id }

          // Get user and update user model with event.
          return User.findById('5cb49e82841d603afe8639b3')
        })
        .then((user) => {
          if (!user) {
            throw new Error('User does not exist.')
          }

          user.createdEvents.push(event)
          return user.save()
        })
        .then((result) => {
          console.log(result)
          return createdEvent
        })
        .catch((err) => {
          console.log(err)
          throw err
        })
    },
    createUser: (args) => {
      return User
        .findOne({ email: args.userInput.email})  // Check that user email is unique.
        .then((user) => {
          if (user) {
            throw new Error('User exists already.')
          }

          return bcrypt.hash(args.userInput.password, 12)
        })
        .then((hashedPassword) => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          })

          return user.save()
        })
        .then((result) => {
          return { ...result._doc, password: null, id: result.id }
        })
        .catch((err) => {
          throw err
        })
    }
  },
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
