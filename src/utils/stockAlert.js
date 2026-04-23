const isLowStock = (quantityInStock, threshold) => Number(quantityInStock) <= Number(threshold);

module.exports = { isLowStock };
