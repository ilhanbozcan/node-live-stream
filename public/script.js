const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})


document.getElementById('nick').innerHTML= `Welcome ${NICK}`

console.log(document.getElementById("form"))


var userC = 1;


const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

var streamer;
socket.on('open-stream',(clientList,userId)=>{
  document.getElementById('online').innerHTML= clientList

    if(clientList <3 ){
      console.log('if girdi')
        const myVideo = document.createElement('video')
        myVideo.muted = true
    
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:false
        }).then(stream=>{
            streamer = stream;
            addVideoStream(myVideo,stream,userId);

        })

      
      myPeer.call(userId,streamer)

    }
    else{
      console.log('else girdi')
        myPeer.call(userId,streamer)
        console.log('watcher in')
       
    }

    myPeer.on('call',call=>{
      console.log('calling')
      call.answer(streamer);
      const video = document.createElement('video')
      video.muted = true
      call.on('stream',userVideoStream=>{
          addVideoStream(video,userVideoStream,userId)
      })
  })




   

    
})


socket.on('update-user',count => {
  document.getElementById('online').innerHTML= count

})



socket.on('user-disconnected', (userId,userCount) => {
document.getElementById('online').innerHTML= userCount
userC = userCount;
  console.log('disconnect',userId)

  if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream,userId) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

socket.on('message-receive',(message,nick)=>{
  let chat = document.getElementById("messageList")

  let tr = document.createElement('tr');

  let m = document.createElement('th');
  m.textContent = `${nick} : ${message}`
  tr.append(m)
  chat.append(tr)
  document.getElementById('message').value = ""

})



socket.on('start-timer',(c)=>{
 
  if(c != 'canceled'){
    document.getElementById('counter').innerHTML = c 
  }
  else{
    document.getElementById('counter').innerHTML = "Waiting for client"
  }
})



function sendMessage(){
  let m = document.getElementById('message').value

  socket.emit('send-message',m,NICK,ROOM_ID)
}