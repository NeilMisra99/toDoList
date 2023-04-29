require("dotenv").config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require('lodash');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
 
app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/toDoListDB')
}

const itemsSchema = new mongoose.Schema({
    name: String,
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    todayItems: [itemsSchema],
    varLists: [listSchema],
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
const User = mongoose.model("User", userSchema);

const item1 = new Item({
    name: "Welcome to your to-do list!"
})


const item2 = new Item({
    name: "Hit the + button to add a new item"
})


const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

let arrLists=[];

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
  
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/home",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
      }
    )
  );

app.get("/", (req, res)=>{
    res.render("start");
})

app.get("/register", (req, res)=>{
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/login");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/home");
          });
        }
      }
    )});

app.get('/auth/google',
    passport.authenticate('google', { scope:
        ['profile' ] }
));
  

app.get(
    "/auth/google/home",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      res.redirect("/home");
    }
);

app.get("/login", (req, res) =>{
    res.render("signin");
})

app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/home");
    }
  );

app.get("/home", (req, res) => {
    if (req.isAuthenticated()) {
        User.findById({_id: req.user._id}).then((foundUser) =>{
            if(foundUser.todayItems.length === 0)
            {
                defaultItems.forEach((item) =>{
                    foundUser.todayItems.push(item);
                });
                foundUser.save().then(()=>{
                    arrLists = foundUser.varLists;
                    res.render("list", {listTitle: "Today", newListItem: defaultItems, route: "/home", lists: arrLists});
                })
            }
            else
            {
                arrLists = foundUser.varLists;
                res.render("list", {listTitle: "Today", newListItem: foundUser.todayItems, route: "/home", lists: arrLists});
            }
        });
      } else {
        res.redirect("/login");
      }   
    })

app.post("/home", (req, res) =>{
    const itemName = req.body.listItem;
    if(itemName === "")
    {
        res.redirect("/home");
    }
    else
    {
        const newItem = new Item({
            name: itemName
        });
        User.findById({_id: req.user._id}).then(async (foundUser) =>{
            foundUser.todayItems.push(newItem);
            await foundUser.save();
        }).then(()=>{
            res.redirect("/home");
        })
    }
})

app.post("/delete", (req, res) =>{
    const idToDelete = req.body.checkBox;

    if(req.body.listTitle === "Today")
    {
        User.findById({_id: req.user._id}).then(async (foundUser) =>{
            foundUser.todayItems.forEach((item) =>{
                if(item.id === idToDelete)
                {
                    foundUser.todayItems.splice(foundUser.todayItems.indexOf(item), 1);
                }
            })
            await foundUser.save();
                
        }).then(()=>{
            res.redirect("/home");
        })
    }
    else
    {
        User.findById({_id: req.user._id}).then(async (foundUser) =>{
            foundUser.varLists.forEach((result)=>{
                if(result.name === req.body.listTitle)
                {
                   result.items.forEach((item)=>{
                        if(item.id === idToDelete)
                        {
                           result.items.splice(result.items.indexOf(item), 1);
                        }
                    })
                }
            })
            await foundUser.save();
        }).then(()=>{
            res.redirect("/"+req.body.listTitle);
        })
    }
})

app.post("/deleteList", (req, res) =>{
    User.findById({_id: req.user._id}).then(async (foundUser) =>{
        foundUser.varLists.forEach((list)=>{
            if(list.name === req.body.listTitle)
            {
                foundUser.varLists.splice(foundUser.varLists.indexOf(list), 1);
            }
        })
        await foundUser.save();
    }).then(()=>{
        res.redirect("/home");
    })
})

app.get("/addList", (req, res)=>{
    if (req.isAuthenticated()) {
        res.render("addList", {lists: arrLists});
    }
    else
    {
        res.redirect("/login");
    }
})

app.post("/addList", (req, res)=>{
    if(req.body.newList === "")
    {
        res.redirect("/addList");
    }
    else
    {
        const customListName = _.capitalize(req.body.newList);
        User.findById({_id: req.user._id}).then(async (foundUser) =>{
            foundUser.varLists.every((list)=>{
                if(list.name === customListName)
                {
                    arrLists = foundUser.varLists;
                    res.render("list", {listTitle: foundList.name , newListItem: foundList.items, route: "/"+foundList.name, lists: arrLists});
                    return false;
                }
                else
                {
                    return true;
                }
            })
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            foundUser.varLists.push(list);
            await foundUser.save().then(()=>{
                res.redirect("/"+list.name);
            })
        })
    }
})

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
  });

app.get("/:category", (req, res) =>{
    if (req.isAuthenticated()) {
        const customListName = _.capitalize(req.params.category);

        User.findById({_id: req.user._id}).then((foundUser) =>{
            foundUser.varLists.forEach((list)=>{
                if(list.name === customListName)
                {
                    arrLists = foundUser.varLists;
                    res.render("list", {listTitle: list.name , newListItem: list.items, route: "/"+list.name, lists: arrLists});
                }
            })
        })
    }
    else
    {
        res.redirect("/login");
    }
})

app.post("/:category", (req, res) =>{
    if(req.body.listItem === "")
    {
        res.redirect("/"+req.params.category);
    }
    else
    {
        const newListItem = new Item({
            name: req.body.listItem
        });
        User.findById({_id: req.user._id}).then(async (foundUser) =>{
            foundUser.varLists.forEach((list)=>{
                if(list.name === req.params.category)
                {
                    list.items.push(newListItem);
                }
            })
            await foundUser.save();
        }).then(()=>{
            res.redirect("/"+req.params.category);
        })
    }
})

app.listen(process.env.PORT, () => {
    console.log("Server is listening on port 3000");
})