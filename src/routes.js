const express = require('express');
const router = express.Router();

router.route('/').get((req, res, next)=>{

    return res.status(200).send({
        success: true,
        message: "It Works",
        data: {},
    });
});


module.exports = router;