var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user");

//root route
router.get("/", (req, res) => {
    res.render("landing");
});

// show register form
router.get("/register", (req, res) => {
    res.render("register");
});

//handle sign up logic
router.post("/register", (req, res) => {
    const newUser = new User({ username: req.body.username });
    if (req.body.adminCode === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
            res.redirect('/register');
            return;
        }
        passport.authenticate("local")(req, res, () => {
            req.flash('success', 'Successfull Registry. Nice to meet you', user.username + '. Loged in')
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", (req, res) => {
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        failureRedirect: "/login",
        failureFlash: true
    }),(req,res)=>{
        req.user.isAdmin ? 
        req.flash('success','Welcome back Admin '+req.user.username) : 
        req.flash('success','Welcome back User '+req.user.username);
        res.redirect('/campgrounds')
    });

// logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash('info', 'Logged you out. Bye')
    res.redirect("/campgrounds");
});

module.exports = router;