const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT||3000
const publicDirectoryPath   =  path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New Websocket connection')

    // socket.emit('message',generateMessage('Welcome!'))
    // socket.broadcast.emit('message',generateMessage('A new user has joined!'))
   
    socket.on('join',({userName,room},callback) => {
        
        const {error,user} = addUser({id:socket.id,userName,room})
        
        if(error){
            return callback(error)
        }
        
        socket.join(user.room)
        
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.userName} has joined!`))
       
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)     
        })
        callback()
    })


    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity Not Allowed!')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.userName,message))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user  = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.userName,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.userName} has left!`))

            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })


    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })
})

server.listen(port,()=>{
    console.log(`Server is up and runing on port ${port}!`)
})