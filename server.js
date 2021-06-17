const { User } = require('./db.js') 
const { SECRET, PORT } = require('./constant.js') 
const Bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const express = require('express')

const app = express()
app.use(express.json()) // 接受前端传过来的 json 数据

// 查看用户
app.get('/api/users', async(req, res) => {
    // 查找所有的用户
    const user = await User.find()
    res.send(user)
})

// 注册
app.post('/api/register', async(req, res) => {
    // 创建用户，存入数据库
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    res.send(user)
})

// 登录
app.post('/api/login', async(req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })

    // 用户不存在
    if(!user) {
        return res.status(422).send({
            message: '不存在此用户！'
        })
    }

    // 密码错误，使用 Bcrypt 对比用户密码是否正确
    const passwordValidate = Bcrypt.compareSync(req.body.password, user.password)
    console.log(passwordValidate);
    if(!passwordValidate) {
        return res.status(422).send({
            message: '密码错误！'
        })
    }

    /**
     * @description 生成 token
     * @param {String|object|Buffer} payload
     * @param {String} SECRET 密钥
     */ 
    const token = JWT.sign({
        id: String(user._id)
    }, SECRET)

    // 返回信息
    res.send({
        user,
        token: token
    })
})

// express 中间件
const auth = async(req, res, next) => {
    const authorization = req.headers.authorization
    const token = String(authorization).split(' ').pop()

    // 校验 token，解出用户 id
    const { id } = JWT.verify(token, SECRET) // { id: '60ca03550f6c7a0fdcf8722f', iat: 1623894683 }
   
    // 通过 id 查找用户
    req.user = await User.findById(id)

    // 调用下一个中间件
    next()
}

// 获取个人信息，验证 token
app.get('/api/profile', auth, async(req, res) => {
    res.send(req.user)
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})