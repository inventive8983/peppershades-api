const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_9M2anU89BRFyWZiaFL99fP4h00DLC8OHWS");
const Project = require("../models/project");
const User = require('../models/user');
const bodyParser = require("body-parser");
const endpointSecret = 'whsec_rgYc7DPXfWEWwtXwCVGKeWquNQHZiYpy';

router.get("/pay/:projectId", async function(req, res) {
  const projectId = req.params.projectId;
  const project = await Project.findById(projectId);
  await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.session.passport.user.user.email,
      line_items: [
        {
          name: project.name,
          description: "Inclusive of 2% transaction charges",
          amount: (project.pay.totalAmount - project.pay.paidAmount) * 100,
          currency: "inr",
          quantity: 1
        }
      ],
      metadata:{
        projectId: projectId
      },
      success_url: "https://www.google.com",
      cancel_url: "https://www.yahoo.com"
    }).then(session => {
      res.send(session);
    }).catch(err => {
      console.log(err)
      res.status(400)      
    })
    
  });

router.post('/webhook', bodyParser.raw({type: '*/*'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
    Project.updateOne({_id:event.data.object.metadata.projectId},{ $inc : {
       "pay.paidAmount": ([Math.ceil(session.display_items[0].amount)] / 100)
      } ,
        $push:{
          "pay.txnID": session.id
        }}
      ).then(result=>{
        console.log("Success")
      }).catch(err=>{
        console.log(err)
        res.status(400).json({
            message:err
        })
    })
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});


  
module.exports = router;
