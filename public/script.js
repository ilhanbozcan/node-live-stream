const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})


document.getElementById('nick').innerHTML= `Welcome ${NICK}`


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
        myPeer.call(userId,streamer)
       
    }

    myPeer.on('call',call=>{
      call.answer(streamer);
      const video = document.createElement('video')
      video.muted = true
      call.on('stream',userVideoStream=>{
          addVideoStream(video,userVideoStream,userId)
      })
      call.on('close', () => {
        video.remove()
      })
    
      peers[userId] = call
  })



    
})


socket.on('update-user',count => {
  document.getElementById('online').innerHTML= count

})



socket.on('user-disconnected', (userId,userCount) => {
document.getElementById('online').innerHTML= userCount
userC = userCount;

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
  console.log('timer',c)
  if(c == 'no'){
    document.getElementById('counter').innerHTML = "Waiting for client"

  }
  else if(c == 'canceled'){
    window.location.reload()
  }
  else{
    document.getElementById('counter').innerHTML = c
  }
})



function sendMessage(){
  let m = document.getElementById('message').value

  socket.emit('send-message',m,NICK,ROOM_ID)
}