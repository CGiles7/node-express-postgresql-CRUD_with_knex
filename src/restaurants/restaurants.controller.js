const restaurantsService = require("./restaurants.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}

async function create(req, res, next) {
  const { restaurant_name, cuisine, address, ...invalidProps } = req.body.data;

  if (!restaurant_name || !cuisine || !address) {
    return res.status(400).json({
      error: "restaurant_name, cuisine, and address are required fields.",
    });
  }

  if (Object.keys(invalidProps).length > 0) {
    return res.status(400).json({
      error: `Invalid property(ies): ${Object.keys(invalidProps).join(", ")}`,
    });
  }

  const newRestaurant = await restaurantsService.create({
    restaurant_name,
    cuisine,
    address,
  });

  res.status(201).json({ data: newRestaurant[0] });
}

async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}

async function destroy(req, res, next) {
  const { restaurant_id } = res.locals.restaurant;

  await restaurantsService.destroy(restaurant_id);

  res.sendStatus(204);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
