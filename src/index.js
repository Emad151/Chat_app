const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const app = express()
const port = process.env.port
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom, checkExistence} = require('./utils/users')

const viewsPath = path.join(__dirname, '../public/views')
app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.get('', (req, res) => {
    res.render('index')
})
app.get('/nameSearch/:room/:username', (req,res)=>{
    res.send({
        nameExists: checkExistence({
            username: req.params.username,
            room: req.params.room
        })
    })
})
app.get('/chat', (req, res) => {
    const {username, room} = req.query
    res.render('chat', {username, room})
})

//express usually does this operation by default, however we
// needed to explicitly do it to use it with socket
const server = http.createServer(app)    

const io = new socketIo.Server(server)

io.on('connection', (socket)=>{
    console.log('new connection')
    socket.on('join', (joinInfo)=>{
        const {user, error} = addUser({
            id:socket.id,
            username: joinInfo.username,
            room: joinInfo.room
        }) 
        if (error) {
            return console.log(error)
        }
        socket.join(user.room)
        socket.emit('chat message', generateMessage(`Welcome ${user.username}`), '')
        socket.broadcast.to(joinInfo.room).emit('chat message', generateMessage(`${user.username} joined`), '')
    })
    
    socket.on('chat message', (msgText)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('chat message', generateMessage(msgText), user.username)
    })
    socket.on('my location', (coords, callback)=>{
        const user = getUser(socket.id)
        const location = `<a href="https://www.google.com/maps?q=${coords.latitude},${coords.longitude}" target="_blank">My Location</a>`
        io.to(user.room).emit('chat message', generateMessage(location), user.username)
        callback()
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        socket.broadcast.to(user.room).emit('chat message',generateMessage(`${user.username} has left the room`), '')
    })
})


const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))
server.listen(port, () => console.log(`Example app listening on port ${port}!`))