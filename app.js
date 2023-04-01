const express = require("express");
//const date = require(__dirname+"/date.js");
const app = express();
const mongoose = require("mongoose");
const _ = require('lodash');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-nilaanjann:Fullmetalalchemist0@todolist.nnosv2i.mongodb.net/blogPostsDB');
}

const itemsSchema = new mongoose.Schema({
    name: String,
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

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

//const items = ["Eat hot dogs", "Eat more hot dogs", "Eat even more hot dogs"];
//const workItems = [];

app.get("/", (req, res) => {
    //let day = date.getDate();
    Item.find().then((foundItems, err) => {
        if(err)
        {
            console.log(err);
        }
        else if(foundItems.length === 0)
        {
            Item.insertMany(defaultItems)
            .then(() => {
                console.log("Items have been successfully added to DB");
                res.render("list", {listTitle: "Today", newListItem: defaultItems, route: "/"});
            })
            .catch((err) => {
                console.log(err);
            })
        }
        else
        {
            res.render("list", {listTitle: "Today", newListItem: foundItems, route: "/"});
        }
    })
});

app.post("/", (req, res) =>{
    const itemName = req.body.listItem;

    const newItem = new Item({
        name: itemName
    });

    newItem.save();
    res.redirect("/");

    // items.push(req.body.listItem);
    // res.redirect("/");
})

app.post("/delete", (req, res) =>{
    const idToDelete = req.body.checkBox;
    if(req.body.listTitle === "Today")
    {
        Item.findByIdAndRemove(idToDelete)
        .catch((err) =>{
            console.log(err);
        })
        .then(()=>{
            console.log("Successfully deleted checked item.");
            res.redirect("/");
        })
    }
    else
    {
        console.log(idToDelete);
        List.findOne({name: req.body.listTitle}).then((foundList) =>{
            foundList.items.pull({_id: idToDelete});
            foundList.save();
            res.redirect("/"+req.body.listTitle);
        })
    }
})

// app.get("/work", (req, res) => {
//     res.render("list", {listTitle: "Work List", newListItem: workItems, route: "/work"});
// })

app.get("/:category", (req, res) =>{
    const customListName = _.capitalize(req.params.category);

    List.findOne({name: customListName})
    .then((foundList) =>{
        res.render("list", {listTitle: foundList.name , newListItem: foundList.items, route: "/"+foundList.name});
    }).catch((err) =>{
        const list = new List({
            name: customListName,
            items: defaultItems
        })
        list.save();
        res.render("list", {listTitle: list.name , newListItem: list.items, route: "/"+list.name});
    })
})

app.post("/:category", (req, res) =>{
    const newListItem = new Item({
        name: req.body.listItem
    })
    
    List.findOne({name: req.params.category})
        .then((foundList) =>{
           foundList.items.push(newListItem);
           foundList.save();
           res.redirect("/"+foundList.name)
        })
})

// app.post("/work", (req, res) =>{
//     workItems.push(req.body.listItem);
//     res.redirect("/work");
// })

// app.get("/about", (req, res) =>{
//     res.render("about");
// })

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})