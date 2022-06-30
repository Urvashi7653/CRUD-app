//require modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { validationResult, check } = require("express-validator");

const app = express();

//use modules
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());

//make connection to mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB");

//creating schema
const itemsSchema = {
  title: {
    type: String,
    //required: [true, "Must add title"],
  },
  description: {
    type: String,
    //required: [true, "Must describe"],
  },
  status: {
    type: String,
    enum: ["In progress", "Not started", "Done"],
    required: [true, "What is the status"],
  },
};

//creating model
const Item = mongoose.model("Item", itemsSchema);
Item.createIndexes();

//creating default items
const item1 = new Item({
  title: "Coding hour",
  description: "Practice coding",
  status: "In progress",
});

const item2 = new Item({
  title: "Yoga class",
  description: "Practice in morning",
  status: "Done",
});

const item3 = new Item({
  title: "Sleep",
  description: "Sleep atleast 8 hours",
  status: "Not started",
});

const defaultItems = [item1, item2, item3];

//home page
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items added to DB");
        }
        res.redirect("/");
      });
    } else {
      res.render("read", {
        listItems: foundItems,
      });
    }
  });
});

//creation page
app.get("/create", function (req, res) {
  res.render("create");
});

//update page
app.get("/update/:id", async function (req, res) {
  const item = await Item.findById({ _id: req.params.id });
  console.log(item);
  res.render("update", { item: item });
});

//Add items
app.post(
  "/create",
  [
    check("listTitle", "Title can have maximum 15 characters.").isLength({
      max: 15,
    }),
    check("listTitle", "Title must be present.").isLength({ min: 1 }),
    check("listDesc", "Description must be present").isLength({ min: 1 }),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    const alert = errors.array();
    const a = await Item.findOne({ title: req.body.listTitle });

    if (a) {
      console.log(alert);
      return res.render("create", { alert: [{ msg: "Title already exists" }] });
    }
    if (!errors.isEmpty()) {
      console.log(alert);
      return res.render("create",{ alert });
    }
    

    if (errors.isEmpty()) {
      const newItem = new Item({
        title: req.body.listTitle,
        description: req.body.listDesc,
        status: req.body.listStatus,
      });

      newItem.save();
    }
    return res.redirect("/");
  }
);


app.delete("/delete/:id",async(req,res)=>{
  const id = req.params.id;
  await Item.findByIdAndDelete(id)
  res.json({success: true})
})
  

//delete items
// app.post("/delete", function (req, res) {
//   const ItemId = req.body.deleteButton;
//   Item.findByIdAndRemove(ItemId, function (err) {
//     if (!err) {
//       console.log(ItemId);
//     }
//     res.redirect("/");
//   });
// });

//updating items
app.post("/update/:id", function (req, res) {
  Item.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.listTitle,
      description: req.body.listDesc,
      status: req.body.listStatus,
    },
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log(docs);
      }
    }
  );
  res.redirect("/");
});

app.get("/about", function (req, res) {
  res.render("about");
});

//listening app on localhost:3000
app.listen(8000, function () {
  console.log("Server started at port 8000");
});
