//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolist2",{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false});

//var k=0;

const ItemsSchema = new mongoose.Schema({
  name: String
});

const Item =mongoose.model("Item", ItemsSchema);

const item1 = new Item ({
  name: "brush teeth"
});

const item2 = new Item ({
  name: "take a bath"
});

const item3 = new Item ({
  name: "do the homework"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [ItemsSchema]
};

const List = mongoose.model("List",listSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
  //const day = date.getDate();
 Item.find({},function(err,foundItems){
   if(foundItems.length ===0){
     Item.insertMany(defaultItems, function (err){
       if (err){
         console.log(err);
       }else{
         console.log("successfully added");
         //k=1;
       }
     });
     res.redirect("/");
   }
  else{
     res.render("list", {listTitle: "Today", newListItems: foundItems});
   }
 })
});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
     if(!foundList){
       //create a new list
       const list = new List({
         name: customListName,
         items: defaultItems
       });
       list.save();
        res.redirect("/" + customListName)
     }else{
       //show the existing list
       res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
     }
    }
  });
  //
  // const list = new List({
  //   name: customListName,
  //   items: defaultItems
  // });
  // list.save();
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

 if(listName === "Today"){
   item.save();
   res.redirect("/");
 }else{
   List.findOne({name: listName}, function(err,foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName);
   })
 }

  //
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req, res){
  const  checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("sucess");
        res.redirect("/");
      }
    });

  }else{
   List.findOneAndUpdate({name: listName},{$pull: {items : {id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
  }

})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
