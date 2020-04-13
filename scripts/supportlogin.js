const jwt = require('jsonwebtoken')
const {userValidation} = require('./validate')

const credentials = [{
    name: 'Yuvraj Midha',
    username: 'peppershades_ceo',
    password: "5q23+4i&g562%",
    designation: 'Co-Founder',
    role: 'Admin'
},
{
    name: 'Anuj Bansal',
    username: 'anuj_peppershades',
    password: '23$645%dy&ou98',
    designation: 'Senior Web Developer',
    role: 'Admin'
},
{
    name: 'Saiansh Arya',
    username: 'saiansh_arya',
    password: '34^5*&@#fd(12',
    designation: 'Marketing',
    role: 'Admin'
},
{
    name: 'Normal User',
    username: 'user',
    password: '986@5?@#fd12%',
    designation: 'Unknown',
    role: 'Support'
}
]

function titleCase(sentence) {
       sentence = sentence[0].toUpperCase() + sentence.slice(1);
        return sentence;
 }


module.exports = (req, res, next) => {

    console.log(req.body)
    const {error} = userValidation(req.body)
    if(error) return res.status(400).render('login', {type: 'danger', message: titleCase(error.details[0].message.replace('"', '').replace('"', ''))})

    const user = credentials.filter(user => user.username === req.body.username)[0]
    if(!user) return res.render('login', {type: 'danger', message: "User not found"})

    const password = req.body.password === user.password
    if(!password) return res.render('login', {type: 'danger', message: "Password not matched"})
    
    const token = jwt.sign({
        name: user.name,
        designation: user.designation
    }, 'token')

    if(!token) return res.render('login', {type: 'danger', message: "Please try again"})
        
    res.cookie('user', token)
    console.log(token)
    res.redirect('/api/support/')
}