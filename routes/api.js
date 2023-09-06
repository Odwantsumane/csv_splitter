const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const request = require('../axios/requests')

module.exports = router;

const DB = [];
const gen_id = uuid.v4();

router.get("/all", (req, res) => {

    res.send(DB);
})

router.get("/:id", findIndex, (req, res) => {
    if(res.index)
        res.send(DB[res.index]);
    
    res.send({}).status(404).json({ message: "user not found"});
});

router.post("/register", (req, res) => {
    // to be safe define all you expect e.g

    const user = {
        "userId": gen_id,
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "Department": req.body.Department,
        "email_address": req.body.email_address,
        "messages": [], // messages asked and responses
    }

    try {

        DB.push(user);

    } catch (error) {
        res.status(500).json({ message: error })
    }


    res.send(DB).status(200).json({ message: "user registered successfully"});
});

router.put("/updateUserdDetails/:userId", findIndex, (req, res) => {

    try {
        
        // check if something is being sent
        if (!(req.body.firstName && req.body.lastName && req.body.Department))
            res.status(401).json({ message: "no data was provided for updating"});

        // update
        if (req.body.firstName)
            DB[res.index].firstName = req.body.firstName;
        if (req.body.lastName)
            DB[res.index].lastName = req.body.lastName;
        if (req.body.Department)
            DB[res.index].Department = req.body.Department;

        
        
    } catch (err) {
        res.status(500).json({ message: err })
    }

    res.send(DB).status(200).json({ message: "updated successfully"});
})

router.post("/upload", (req, res) => {
    
})

router.post("/sendMessage/:userId", findIndex, (req, res) => {
    // to be safe define all you expect e.g

    const message = {
        "question": req.body.message,
        "answer": request(req.body.message),
    }

    try {

        DB[res.index].messages.push(message);

    } catch (error) {
        res.status(500).json({ message: error })
    }

    res.send(DB).status(200).json({ message: "user added successfully"});
});

async function findIndex(req, res, next) {
    let index;

    try {
        const toSearch = (user) => user.id === req.params.userId;
        index = DB.findIndex(toSearch);

    } catch (error) {
        res.status(500).json({ message: error });
    }
    
    res.index = index;
    next();
}

