const User = require('../../models/user')
const bcrypt = require('bcryptjs')

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email }) // Check that user email is unique.
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
    } catch (err) {
      throw err
    }
  }
}
