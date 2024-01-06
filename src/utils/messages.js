const moment = require('moment')


const generateMessage = (text)=>{
    return {
        text,
        createdAt: moment(new Date().getTime()).format('h:m a')
    }
}
module.exports = {
    generateMessage
}