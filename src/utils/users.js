const users = []

//add user
const addUser = ( {id,userName,room} )=>{

    //Clean the data
    userName = userName.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate Data

    if(!userName || !room){
        return {
            error:'Username and room are required!'
        }
    }

    //check for exiting user
    const existingUser = users.find((user)=>{
        return user.room === room && user.userName === userName
    })

    //Validate User name

    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //Store User
    const user = {id,userName,room}
    users.push(user)
    return {user}

}

//remove user

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//get user
const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

//get users in room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
    
}


module.exports= {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

