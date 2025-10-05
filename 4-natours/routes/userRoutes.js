
const express = require('express')

const userController =require('./../controllers/userController') 
const authController =require('./../controllers/authController') 
const router = express.Router();
/*
const getAllUsers = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
const getUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}

const createUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}

const deleteUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
const updatedUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
*/

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.protect) // yukarıdakiler hariç hepsinde kullancak


// kullnıcının yapacakları
router.patch('/updateMyPassword',   authController.updatePassword)
router.patch('/updateMe',  userController.updateMe)
router.delete('/deleteMe',  userController.deleteMe)
router.route('/me').get( userController.getMe, userController.getUser)

router.use(authController.restrictTo('admin')) 
// adminin yaptıkları
router.route('/').get(userController.getAllUsers)

router.route('/:id').get(userController.getUser).patch(userController.updatedUser).delete(userController.deleteUser)

module.exports =router;