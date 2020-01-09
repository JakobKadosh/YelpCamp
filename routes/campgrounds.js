const express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    Comment=require("../models/comment"),
    middleware = require('../middleware'),
    { checkCampgroundOwnership, isLoggedIn } = middleware;

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
//INDEX - show all campgrounds
router.get("/", (req, res) => {
    if (req.query.search && req.xhr) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({ name: regex }, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(allCampgrounds);
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, (err, allCampgrounds) => {
            if (err) {
                req.flash('error', 'Failed to laod campgrounds.')
                console.log(err);
            } else {
                if (req.xhr) {
                    res.json(allCampgrounds);
                } else {
                    res.render("campgrounds/index", { campgrounds: allCampgrounds, page: 'campgrounds' });
                }
            }
        });
    }
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, (req, res) => {
    // get data from form and add to campgrounds array
    const name = req.body.name,
        image = req.body.image,
        desc = req.body.description,
        price = req.body.price,
        author = {
            id: req.user._id,
            username: req.user.username
        };
    const newCampground =
    {
        name: name, image: image, description: desc,
        price: price, author: author
    };
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
            console.log(err);
            req.flash('error', err.message)

        } else {
            //redirect back to campgrounds page
            req.flash('info', 'Campground' + newlyCreated.name + 'added.');
            res.redirect("/campgrounds");
        }
    });

});


// SHOW - shows more info about one campground
router.get("/:id", (req, res) => {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
            req.flash('error', err.message)

        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});
// EDIT campground route
router.get('/:id/edit', isLoggedIn, checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash('error', err.message)
        }
        res.render('campgrounds/edit', { campground: campground })
    })
});

// UPDATE campground route
router.put('/:id', checkCampgroundOwnership,(req, res) => {
    const newData = { name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price };
    Campground.findByIdAndUpdate(req.params.id, { $set: newData }, (err, updatedCampground) => {
        if (err) {
            req.flash('error', err.message);
            console.log(err);
        }
        req.flash('info', 'Campground updated.');

        res.redirect('/campgrounds/' + updatedCampground._id)
    });

});
// DELETE campground route
router.delete('/:id', isLoggedIn, checkCampgroundOwnership, (req, res) => {
console.log(req.body.campground)
    Comment.remove({
        _id: {
            $in: req.campground.comments
        }
    }, (err) => {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/');
        } else {
            Campground.findByIdAndRemove(req.params.id, (err) => {
                if (err) {
                    console.log('ERROR', err);
                    req.flash('error', err.message);
                }
                req.flash('info', 'Campground deleted.');
                res.redirect('/campgrounds')
            })
        }
    })
});
module.exports = router;