const socket = io('/');
const videoGrid=document.getElementById('video-grid')
const myPeer = new Peer(undefined,{
    host: '/',
    port: '3001'
});




myPeer.on('open',id=>{
    console.log('myPeer opened')
    socket.emit('join-room',ROOM_ID,id)
})
var streamer;
socket.on('open-stream',(clientList,userId)=>{
    if(clientList ==1 ){
        const myVideo = document.createElement('video')
        myVideo.muted = true
    
        navigator.mediaDevices.getUserMedia({
            video:true,
            audio:false
        }).then(stream=>{
            streamer = stream;
            addVideoStream(myVideo,stream);

        })
    }
    else{
        myPeer.call(userId,streamer)
        console.log('watcher in')
       
    }

    myPeer.on('call',call=>{
        console.log('calling')
        call.answer(streamer);
        const video = document.createElement('video')
        video.muted = true
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })

   

    
})



function connectToNewUser(userId,stream){
    const call = myPeer.call(userId,stream)
    const video= document.createElement('video')
    call.on('stream',userVideoStream=>{
        addVideoStream(userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })
}


function addVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video);
}

