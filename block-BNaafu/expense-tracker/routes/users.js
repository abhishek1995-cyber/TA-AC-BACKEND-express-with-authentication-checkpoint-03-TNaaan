var express = require('express');
const user = require('../models/user');
var router = express.Router();
var User = require('../models/user');
var Income = require('../models/income');
var Expense = require('../models/expense');
var moment = require('moment');
var bcrypt = require(`bcrypt`);
var auth = require('../middlewares/auth');




router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register',(req,res,next)=>{
  User.create(req.body,(err,user)=>{
    if (err) return next(err);
    res.redirect('/users/login')
  })
})

router.get('/login',(req,res,next)=>{
  var error = req.flash('error')[0];
  var nouser = req.flash('nouser')[0];
  var noresult = req.flash('noresult')[0];
  res.render('login',{error,nouser,noresult})
})

router.post('/login',(req,res,next)=>{
  var {email,password} = req.body;
  if(!email || !password){
  req.flash('error','Email/Password is required')
   return res.redirect('/users/login')
  }
  User.findOne({email},(err,user)=>{
    if (err) return next(err);
    // no user
    if(!user){
      req.flash("nouser", "User not found")
     return res.redirect('/users/login')
    }
    // compare password

    user.verifyPassword(password,(err,result)=>{
      if (err) return next(err);
      if(!result){
        req.flash("noresult","password didnn't match"  )
        return res.redirect('/users/login')
       }
       // persist loggedin user information
      req.session.userId = user.id;
      req.session.name = user.name;
      return res.redirect('/users/onboard')
    })
  })
})


/* GET -- LOADING PASSWORD RESET PAGE */
router.get(`/password/reset`, auth.loggedInUser, (req,res, next)=> {
  let name = req.session.name
  res.render(`userPassReset`, {name: name})
})


/* POSTING -- RESETING PASSWORD */


router.post(`/password/reset`, (req,res, next)=> {
  let id = req.session.userId
  let oldpassword = req.body.oldpassword
  User.findOne({_id: id}).exec((err, user) => {
    if(err) return next(err)
    console.log(user)
    user.verifyPassword(oldpassword, async function(err, result) {
      let response = await result
      if(response){
      let hash = await bcrypt.hash(req.body.password, 10)  
      User.findOneAndUpdate({_id: id}, {password: hash}, (err, user) => {
          if(err) return next(err);
          return res.redirect(`/users/logout`)
        })
      } else {
        res.json(`incorrect old password`)
      }
  })
  })

})

// users Onboard

router.get('/onboard', auth.loggedInUser,(req,res,next)=>{
  console.log(req.user)
  res.render('onboard')
})

router.get('/dashboard/expense', auth.loggedInUser,(req,res,next)=>{
  res.render('expense')
})

router.post('/dashboard/expense',(req,res,next)=>{
  req.body.id = req.session.userId;
  Expense.create(req.body,(err,expense)=>{
    if (err) return next(err);
    res.redirect('/users/dashboard')
  })
})

router.get('/dashboard/income', auth.loggedInUser,(req,res,next)=>{
  res.render('income')
});

router.post('/dashboard/income',(req,res,next)=>{
  Income.create(req.body,(err,income)=>{
    if (err) return next(err);
    res.redirect('/users/dashboard')
  })
})


 // Dahboard routes
router.get(
  '/dashboard', auth.loggedInUser,
  (req, res, next) => {
    var{category,source,date,expensedate} = req.query;
    var query = {};
    if(category){
      query.category = category;
    }
    if(source){
      query.source = source;
    }
    if(date){
      query.date = {$gte: date}
    }
    if(expensedate){
      query.expensedate = {$gte: expensedate}
    }
    Income.find(query, (err, income) => {
      if (err) return next(err);
      Income.distinct('source',(err, source)=>{
        if (err) return next(err);
        Income.distinct('date',(err, date)=>{
          if (err) return next(err);
      Expense.find(query, (err, expense) => {
        if (err) return next(err);
        Expense.distinct('category',(err,category)=>{
          if (err) return next(err);
          Expense.distinct('expensedate',(err,expensedate)=>{
            if (err) return next(err);
        res.render('dashboard', { source, category, date, expensedate, income, expense });
      });
    })
  });
    });
    });
  });
  }
);


// filter

router.get('/dashboard/search', auth.loggedInUser,(req, res, next) => {
  var query = req.query;
  var income = query.income;
  console.log(res.locals.income, 'Locals');
});


// -------Logout route--------

router.get('/logout', auth.loggedInUser,(req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
