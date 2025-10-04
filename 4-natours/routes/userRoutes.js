
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
router.patch('/updateMyPassword', authController.protect , authController.updatePassword)
router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)

router.route('/').get(userController.getAllUsers).post(userController.createUser)

router.route('/:id').get(userController.getUser).patch(userController.updatedUser).delete(userController.deleteUser)

module.exports =router;