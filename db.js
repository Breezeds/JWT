const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/express-auth', {
    createIndexes: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {
        type: String,
        set(psd) {
            // 使用 bcrypt 对密码进行加密
            return require('bcrypt').hashSync(psd, 10)
        }
    }
})
const User = mongoose.model('User', UserSchema)

module.exports = { User }