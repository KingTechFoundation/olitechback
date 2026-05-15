require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function verify() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, buying_price, is_package, package_size, package_buying_price, inventory(quantity_in_stock)')
    .eq('is_active', true);

  if (error) return console.error(error);

  const analysis = data.map(p => {
    const qty = Number(p.inventory?.[0]?.quantity_in_stock || 0);
    let unitCost = Number(p.buying_price || 0);
    let isSuspect = false;

    if (p.is_package && Number(p.package_buying_price || 0) > 0) {
      unitCost = Number(p.package_buying_price) / Number(p.package_size);
    } else if (p.is_package && unitCost > 1000) {
      // If it's a package but has a high piece price and NO package price set, it's suspect
      isSuspect = true;
    }

    return {
      name: p.name,
      qty,
      unitCost,
      totalValue: qty * unitCost,
      isSuspect,
      details: p.is_package ? `Pkg Size: ${p.package_size}, Pkg Price: ${p.package_buying_price}` : 'Single Piece'
    };
  });

  console.log('--- TOP 10 MOST VALUABLE STOCK ITEMS ---');
  analysis
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .forEach(item => {
      console.log(`${item.isSuspect ? '⚠️ [SUSPECT]' : '✅'} ${item.name}: ${item.qty} pcs @ ${item.unitCost} = ${item.totalValue.toLocaleString()} RWF (${item.details})`);
    });

  const total = analysis.reduce((acc, i) => acc + i.totalValue, 0);
  console.log('\nTOTAL CALCULATED STOCK VALUE:', total.toLocaleString(), 'RWF');
}

verify();
