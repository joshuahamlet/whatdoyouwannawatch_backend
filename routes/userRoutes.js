const express = require('express')
const router = express.Router()
const User = require('../models/userModel')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')


router
    .route('/test/:userId')
    .get(userController.testUser)


router
    .route('/signup')
    .post(authController.signup)

router
    .route('/login')
    .post(authController.login) 
    
router
    .route('/')
    .get(userController.getAllUsers) //authController.protect, 

router
    .route('/:userId')
    .get(userController.getUser)
    .delete(userController.deleteUser)
    


router.post('/', async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    })

    const savedUser = await user.save()
    res.json(savedUser)
})

module.exports = router