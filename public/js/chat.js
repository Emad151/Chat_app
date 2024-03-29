const socket = io()
const $form = document.getElementById('form')
const $input = document.getElementById('input')
const $messages = document.getElementById('messages')
const $locationButton = document.getElementById('location')
const $submitButton = document.getElementById('submit')
const $sideRoom = document.querySelector('#sidebar h1')
const $sideUsername = document.querySelector('#sidebar h3')
const $usersList = document.querySelector('#sidebar ul')


const autoScroll = ()=>{
        $messages.scrollTop = $messages.scrollHeight;
    }

const {username, room} =  Qs.parse(location.search, {ignoreQueryPrefix: true})
socket.emit('join', {username, room})

$input.focus()
$input.addEventListener('input', (e)=>{
    if ($input.value.trim() === "") {
        $submitButton.disabled = true
    } else {
        $submitButton.disabled = false
    }
})

$form.addEventListener('submit', (e)=>{
    e.preventDefault()
    // disable the button 
    e.target.elements.submit.disabled = true
    socket.emit('chat message', e.target.elements.message.value)
    e.target.elements.message.value = ''
    $input.focus()
    
})
$locationButton.addEventListener('click', (e)=>{
    $input.focus()

    $locationButton.disabled = true
    if (!navigator.geolocation) {
        
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition( position => {
        const coords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }

        socket.emit('my location', coords, ()=>{
            $locationButton.disabled = false
        })
    })
})

socket.on('chat message', (msg, sender)=>{
    const item = `   <p>
                        <span class="message_name">${sender}</span>
                        <span class="message_meta">${msg.createdAt}</span>
                     </p>
                     <p class="message_text">${msg.text}</p>`

    const messageItem = document.createElement('div')
    messageItem.classList.add('message')
    messageItem.innerHTML = item
    $messages.appendChild(messageItem)
    autoScroll()
})

socket.on('new user to the list', ( {username, id} )=>{
        const li = document.createElement('li')
        li.setAttribute('id', `${id}`)
        li.textContent = username
        $usersList.appendChild(li)
})
socket.on('list connected users', (users)=>{
    for (const user of users) {
        if (socket.id == user.id) {
            $sideUsername.textContent = user.username
            $sideRoom.textContent = user.room
        } else {
            const li = document.createElement('li')
            li.setAttribute('id', `${user.id}`)
            li.textContent = user.username
            $usersList.appendChild(li)
        }
        
    }
})

socket.on('remove from list', (id)=>{
    const item = document.getElementById(id)
    if (!item) {
        return//do nothing
    } 
    item.remove()
})