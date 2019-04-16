const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')

const events = async (eventIds) => {
  try {
    const events = await Event.find({_id: {$in: eventIds}})
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      }
    })
  } catch(err) {
    console.log(err)
    throw err
  }
}

const user = async (userId) => {
  try {
    const user = await User.findById(userId)
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    }
  } catch(err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  // Resolvers.
  events: async () => {
    try {
      const events = await Event.find()
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        }
      })
    } catch(err) {
      console.log(err)
      throw err
    }
  },
  createEvent: async (args) => {

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5cb5ade4cfe22b142536b826'  // Hard coded user for now.
    })

    let createdEvent = undefined
    try {
      const result = await event.save()
      createdEvent = {
        ...result._doc,
        _id: event.id,
        date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      }

      // Get user and update user model with event.
      const creator = await User.findById('5cb5ade4cfe22b142536b826')
      if (!creator) {
        throw new Error('User does not exist.')
      }
      creator.createdEvents.push(event)
      await creator.save()

      return createdEvent
    } catch(err) {
      console.log(err)
      throw err
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email})  // Check that user email is unique.
      if (existingUser) {
        throw new Error('User exists already.')
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      })

      const result = await user.save()
      return { ...result._doc, password: null, id: result.id }

    } catch(err) {
      throw err
    }
  }
}
