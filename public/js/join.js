$usernameInput = document.getElementById('username')
$roomInput = document.getElementById('room')
$hint = document.getElementById('hint')
$submitButton = document.querySelector('button')

const url = 'https://justus-1l4q.onrender.com'

$roomInput.focus()
$roomInput.addEventListener('input', (e)=>{
    if ($roomInput.value.trim() !== "") {
        $usernameInput.disabled = false
        $hint.textContent = ''
    }else {
        $usernameInput.disabled = true
        $hint.textContent = 'Enter room first!'
    }
})
$usernameInput.addEventListener('input', async(e)=>{
    if ($usernameInput.value.trim() !== "") {
        $hint.textContent = 'Searching for similar name....'
        const result = await (await fetch(`${url}/nameSearch/${$roomInput.value}/${$usernameInput.value}`)).json()
    
    
    if (result.nameExists) {
        $hint.textContent = 'Name already exists in the room!'
        $submitButton.disabled = true
    }else{
        $submitButton.disabled = false
        $hint.textContent = ''
    }
}
})