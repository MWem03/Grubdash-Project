const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (orders[index].status !== "pending") {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending. Returns a 400 status code`,
    });
  }
  if (orderId && index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id == orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}



function read(req, res) {
  res.json({ data: res.locals.order });
}

function validateOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
  if (!deliverTo || deliverTo === "" || deliverTo === undefined) {
    next({ status: 400, message: "Order must include a deliverTo" });
  }
  if (!mobileNumber || mobileNumber === "") {
    next({ status: 400, message: "Order must include a mobileNumber" });
  }
  if (!dishes) {
    next({ status: 400, message: "Order must include a dish" });
  }
  if (dishes.length === 0 || !Array.isArray(dishes)) {
    next({ status: 400, message: "Order must include at least one dish" });
  }
  for (dish of dishes) {
    const index = dishes.indexOf(dish);
    if (
      !dish.quantity ||
      dish.quantity < 1 ||
      !Number.isInteger(dish.quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function updateOrder(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  if (!status || status === "" || status === "invalid") {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
  if (status === "delivered") {
    next({ status: 400, message: `A delivered order cannot be changed` });
  }
  const foundOrder = res.locals.order;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.json({ data: foundOrder });
}

function updateCheck(reqs,req,next) {
 next();
}

function addOrder(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  let newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}



module.exports = {
  list,
  read: [orderExists, read],
  create: [validateOrder, addOrder],
  update: [orderExists, validateOrder, updateCheck, updateOrder],
  delete: [orderExists, destroy],
};