const Event = require('../../models/event')
const User = require('../../models/user')
const { transformEvent } = require('./merge')
const { dateToString } = require('../../helpers/date')

module.exports = {
  // Resolvers.
  events: async () => {
    try {
      const events = await Event.find()
      return events.map(event => {
        return transformEvent(event)
      })
    } catch (err) {
      console.log(err)
      throw err
    }
  },
  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: '5cb5b41c7dbb3c173b20f440' // Hard coded user for now.
    })

    let createdEvent
    try {
      const result = await event.save()
      createdEvent = transformEvent(result)

      // Get user and update user model with event.
      const creator = await User.findById('5cb5b41c7dbb3c173b20f440')
      if (!creator) {
        throw new Error('User does not exist.')
      }
      creator.createdEvents.push(event)
      await creator.save()

      return createdEvent
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}
