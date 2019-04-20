const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email })
    if (!user) {
      throw new Error('User does not exist')
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Password is incorrect')
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, 'addasupersecretkeyhere', {
      expiresIn: '1h'
    })

    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1
    }
  }
}
