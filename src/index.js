const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
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
    try {
        const {username, room} = req.query
        res.render('chat', {username, room})
    } catch (error) {
        console.log(error)
    }
    
})

//express usually does this operation by default, however we
// needed to explicitly do it to use it with socket
const server = http.createServer(app)    

const io = new socketIo.Server(server)

io.on('connection', (socket)=>{
       socket.on('join', (joinInfo)=>{
        try {
            const {user, error} = addUser({
                id:socket.id,
                username: joinInfo.username,
                room: joinInfo.room
            }) 
            if (error) {
                return console.log(error)
            }
            socket.join(user.room)
            socket.broadcast.to(user.room).emit('new user to the list', user)
            socket.emit('list connected users', getUsersInRoom(user.room))
            socket.emit('chat message', generateMessage(`Welcome ${user.username}`), '')
            socket.broadcast.to(user.room).emit('chat message', generateMessage(`${user.username} joined`), '')
        } catch (error) {
            console.log(error)
        }
        

    })
    
    socket.on('chat message', (msgText)=>{
        try {
            const user = getUser(socket.id)
            io.to(user.room).emit('chat message', generateMessage(msgText), user.username)
        } catch (error) {
            console.log(error)
        }
        
    })
    socket.on('my location', (coords, callback)=>{
        try {
            const user = getUser(socket.id)
            const location = `<a href="https://www.google.com/maps?q=${coords.latitude},${coords.longitude}" target="_blank">My Location</a>`
            io.to(user.room).emit('chat message', generateMessage(location), user.username)
            callback()
        } catch (error) {
            console.log(error)
        }
        
    })
    socket.on('disconnect', ()=>{
        try {
            const user = removeUser(socket.id)
            socket.broadcast.to(user.room).emit('chat message',generateMessage(`${user.username} has left the room`), '')
            socket.broadcast.to(user.room).emit('remove from list', user.id)
        } catch (error) {
            console.log(error.message)
        }
        
    })
})


const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))
server.listen(port, () => console.log(`Example app listening on port ${port}!`))