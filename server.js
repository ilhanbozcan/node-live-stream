const express = require('express')
const app = express()
const server = require('http').Server(app)
const io  = require('socket.io')(server)
const {v4:uuidV4} = require('uuid')
app.set('view engine','ejs')
app.use(express.static('public'))
const session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


app.use(session({secret: 'ssshhhhh'}));


const auth2 = (req,res,next)=>{
    req.session.nick ? next() : res.redirect(301,'/')
}

const stream = true;
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/:room',auth2,(req,res)=>{
    res.render('room',{roomId:req.params.room,nick:req.session.nick})
})

app.post('/login',(req,res)=>{
    console.log(req.body.nick)
    req.session.nick = req.body.nick
    if(req.session.nick){
        res.redirect(301,'/public')
    }
})

var started = false;
io.on('connection',socket=>{
    socket.on('join-room', (roomId,userId)=>{

        
        socket.join(roomId);
        console.log(`user -> ${userId} connected to room ${roomId}` )


        socket.emit('update-user',io.sockets.adapter.rooms.get(roomId).size)

        //
        io.sockets.in(roomId).emit('open-stream',io.sockets.adapter.rooms.get(roomId).size,userId)

      

        socket.on('send-message',(message,nick)=>{
            console.log(message)
            io.sockets.in(roomId).emit('message-receive',message,nick)
        })

  
        if(!started){
            if(userId,io.sockets.adapter.rooms.get(roomId).size > 1){
                started = true
                var timeleft = 180;

                var downloadTimer = setInterval(function(){
                  if(timeleft <= 0){
                    clearInterval(downloadTimer);
                    console.log('canceled')
                    io.sockets.in(roomId).emit('start-timer','canceled')
                    started = false
                  }
                    let c =timeleft + ' for next round';
                    console.log(c)
                    io.sockets.in(roomId).emit('start-timer',c)

                  timeleft -= 1;
                
                }, 1000)

               
                
            }
            else{
                console.log('kisi sayısı yetersiz')
                io.sockets.in(roomId).emit('start-timer','no')
                clearInterval(downloadTimer);
                started = false
            }
        }


        socket.on('disconnect', () => {
            console.log('disconnected')
            socket.to(roomId).broadcast.emit('user-disconnected', userId,io.sockets.adapter.rooms.get(roomId) ? io.sockets.adapter.rooms.get(roomId).size : 0 )
          })
    })





  
       
      
    })

    


server.listen(3000)