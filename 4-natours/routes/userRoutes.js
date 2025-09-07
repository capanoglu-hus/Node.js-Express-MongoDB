
const express = require('express')

const userController =require('./../controllers/userController') 
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


router.route('/').get(userController.getAllUsers).post(userController.createUser)

router.route('/:id').get(userController.getUser).patch(userController.updatedUser).delete(userController.deleteUser)

module.exports =router;