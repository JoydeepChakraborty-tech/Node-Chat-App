// socket.on('countUpdated',(count)=>{
//     console.log('Count Updated to ',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

const socket = io()

//elements

const $messageForm = document.querySelector('#mesage-form')
const $messageFormInput =   $messageForm.querySelector('input')
const $messageFormButton    =   $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate  =   document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate   =   document.querySelector('#sidebar-template').innerHTML

//Options

const {userName,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoScroll = ()=>{
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new Message
    const newMessagesStyle  =   getComputedStyle($newMessage)
    const newMessageMargin  =   parseInt(newMessagesStyle.marginBottom)
    const newMessageHeight  =   $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight =   $messages.offsetHeight

    //Height of messages container  
    const containerHeight   =   $messages.scrollHeight

    //How far I have scrolled
    const scrollOffset  =   $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}


socket.on('message',(message)=>{
    console.log(message)    
    const html = Mustache.render(messageTemplate,{
        userName:message.userName,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')         
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(location)=>{
    console.log(location)
    const html = Mustache.render(locationMessageTemplate,{
        userName:location.userName,
        url:location.url,
        locationCreatedAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)    
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
           return console.log(error)
        }

        console.log('Message Delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your Browser Does not Support Geolocation')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
          console.log('Location shared')
          $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{userName,room},(error)=>{
    if(error){
        alert(error)
        location.href = './'
    }
})