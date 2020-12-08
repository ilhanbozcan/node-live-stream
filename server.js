const express = require('express')
const app = express()
const server = require('http').Server(app)
const io  = require('socket.io')(server)
const {v4:uuidV4} = require('uuid')
app.set('view engine','ejs')
app.use(express.static('public'))

const stream = true;
app.get('/',(req,res)=>{
    res.redirect(301,`/${uuidV4()}`)
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room})
})

io.on('connection',socket=>{
    socket.on('join-room', (roomId,userId)=>{
        console.log(roomId,userId)
        socket.join(roomId);
        io.sockets.in(roomId).emit('open-stream',io.sockets.adapter.rooms.get(roomId).size,userId)
        //socket.to(roomId).broadcast.emit('user-connected',userId)
       
      
    })
})


server.listen(3000)