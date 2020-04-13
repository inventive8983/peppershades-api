let a = "Agroculture & Technical"


function check(item){
    a = a.toLowerCase()
    return a.includes(item)
}


console.log(check('agrocul'))