const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
let nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  let { data: { name, description, price, image_url } = {} } = req.body;
  let newDish = {
    id: ++nextId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function hasName(req, res, next) {
  let { data: { name } = {} } = req.body;
  if (name && name != "") {
    return next();
  }
  next({ status: 400, message: "Dish must include name" });
}

function hasDescription(req, res, next) {
  let { data: { description } = {} } = req.body;
  if (description && description != "") {
    return next();
  }
  next({ status: 400, message: "Dish must include a description" });
}

function hasPrice(req, res, next) {
  let { data: { price } = {} } = req.body;
  if (!price || price <= 0 || typeof(price) != 'number' ) {
    next({ status: 400, message: "Dish must include a price" });
  } 
  next();
}

function hasImage(req, res, next) {
  let { data: { image_url } = {} } = req.body;
  if (image_url && image_url != "") {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url" });
}

function dishExist(req, res, next) {
  let { dishId } = req.params;
  let foundDish = dishes.find((dish) => dish.id == dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  let { dishId } = req.params;
  let foundDish = dishes.find((dish) => dish.id == dishId);
  const { data: { name, description, image_url, price } = {} } = req.body;
  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;

  res.json({ data: foundDish });
}

function hasDishId(req, res, next) {
  let { dishId } = req.params;
  let foundDish = dishes.find(dish => dish.id == dishId);
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${foundDish.id}`,
  });
}

function hasIDMatch(req, res, next) {
  let { dishId } = req.params;
  let { data: { id } = {} } = req.body;
  if(id)
    {
      if (id == dishId) {
        return next();
      }
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  next();
}


module.exports = {
  list,
  hasName,
  hasPrice,
  hasDescription,
  hasImage,
  create: [hasName, hasDescription, hasImage, hasPrice, create],
  read: [dishExist, read],
  update: [
    dishExist,
    hasName,
    hasPrice,
    hasDescription,
    hasImage,
    hasDishId,
    hasIDMatch,
    update,
  ],
  delete: [],
};