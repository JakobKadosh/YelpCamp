const Campground = require("../models/campground"),
    Comment = require("../models/comment");

module.exports = {
    checkCampgroundOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, (err, campground) => {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('back')
                } else {
                    if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
                        req.campground = campground;
                        next();
                    } else {
                        req.flash('error',
                            'You do not have permission to do that, Hacker! FuckOff!');
                        res.redirect('back')
                    }
                }
            })
        } else {
            req.flash('error', 'Please Login First!');
            res.redirect('/login')
        }
    },
    checkCommentOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, (err, comment) => {
                if (err) {
                    req.flash('error', err.message);
                    res.redirect('back')
                } else {
                    if (comment.author.id.equals(req.user._id) || isAdmin) {
                        req.comment=comment;
                        next();
                    } else {
                        req.flash('error',
                            'You do not have permission to do that, Hacker! FuckOff!');
                        res.redirect('/login')
                    }
                }
            })
        } else {
            req.flash('error', 'You need to be logged in to do that');
            res.redirect('/login')
        }
    },
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('info', 'Please login first!');
        res.redirect("/login");
    },
    isAdmin: (req, res, next) => {
        if (req.user.isAdmin) {
            req.flash('info','Admin action dispatched')
            next();
            
        } else {
            req.flash('error', 'This site is now read only thanks to spam and trolls.');
            res.redirect('back');
        }
    }
};