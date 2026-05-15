require('dotenv').config();
const { supabase } = require('./src/config/supabase');
async function run() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, buying_price, package_size, package_buying_price, is_package, is_active, inventory(quantity_in_stock)');
    
    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(JSON.stringify(data, null, 2));
    
    const totalValue = data.reduce((acc, p) => {
      if (p.is_active === false) return acc;
      const qty = Number(p.inventory?.[0]?.quantity_in_stock || 0);
      let unitCost = Number(p.buying_price || 0);
      if (p.is_package && Number(p.package_buying_price || 0) > 0 && Number(p.package_size || 0) > 0) {
        unitCost = Number(p.package_buying_price) / Number(p.package_size);
      }
      return acc + (qty * unitCost);
    }, 0);
    
    console.log('\nCalculated Total Value:', totalValue);
  } catch (err) {
    console.error('Catch Error:', err);
  }
}
run();
