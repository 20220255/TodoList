const express = require('express');
const bodyParser = require('body-parser');
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const open = require('open');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {
//   useNewUrlParser: true,
// });
mongoose.connect(
  'mongodb+srv://admin:r54IfzIcYKlmG1OY@cluster0.lk87m.mongodb.net/todolistDB',
  {
    useNewUrlParser: true,
  }
);

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your To Do List',
});
const item2 = new Item({
  name: 'Hit the + button to add a new item',
});
const item3 = new Item({
  name: '<--- Hit this to delete an item>',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {
  Item.find({}, function (err, items) {
    if (err) {
      console.log(err);
      console.log('err1');
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
            console.log('err2');
          } else {
            console.log('Items successfully inserted.');
            res.redirect('/');
          }
        });
      } else {
        res.render('list', { listTitle: 'Today', newListItems: items });
      }
    }
  });
});

app.post('/', function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);

  const item = new Item({
    name: itemName,
  });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }

  // Item.insertMany([{ name: itemName }], function (err, doc) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     const lastItem = doc.length - 1;
  //     console.log('Item successfully added - ' + doc[lastItem].name);
  //     res.redirect('/');
  //   }
  // });
});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Item successfully deleted with id - ' + req.body.checkbox);
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/:categoryName', function (req, res) {
  // console.log(req.params.categoryName);
  const customListName = _.capitalize(req.params.categoryName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (foundList) {
      // show an existing list
      res.render('list', {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    } else {
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect('/' + customListName);
    }
  });
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.listen(process.env.PORT || 3001, async function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log("Server listening on Port", 3001);
    await open('http://localhost:3001') 
  } 
});
