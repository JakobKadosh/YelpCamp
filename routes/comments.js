const express = require("express"),
    router = express.Router({ mergeParams: true }),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleWare = require('../middleware'),
    { checkCommentOwnership, isLoggedIn } = middleWare;

//Comments New
router.get("/new", isLoggedIn, (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash('error', err.message)
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, (req, res) => {
    //lookup campground using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash('error', 'Campground does not exist.')
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.error(err);
                    req.flash('error', err.message)
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('info', 'Comment added.');
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});
// EDIT comment route
router.get('/:comment_id/edit', isLoggedIn, checkCommentOwnership, (req, res) => {
    res.render('comments/edit', { camp_id: req.params.id, comment: req.comment })
});
// UPDATE comment route
router.put('/:comment_id',isLoggedIn, checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err) => {
        if (err) {
            console.error(err);
            req.flash('error', err.message);

        }
        req.flash('info', 'Comment updated.');
        res.redirect('/campgrounds/' + req.params.id)
    })
});


router.delete('/:comment_id', checkCommentOwnership,isLoggedIn, (req, res) => {
    
    Campground.findByIdAndUpdate(req.params.id, {
        $pull: {
            comments: req.params.comment_id
        }
    }, (err) => {
        if (err) {
            console.log(err);
            req.flash('error', err.message)
            res.redirect('/')
        } else {
            req.comment.remove((err) => {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message)
                    return res.redirect('/')
                }
                req.flash('info', 'Comment deleted.');
                res.redirect('/campgrounds/' + req.params.id);
            });
        }
    });
});

module.exports = router;