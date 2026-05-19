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
    let totalValue = 0;
    let details = "";

    if (p.is_package && Number(p.package_size || 0) > 0 && Number(p.package_buying_price || 0) > 0) {
      const pkgSize = Number(p.package_size);
      const packages = Math.floor(qty / pkgSize);
      const extraPieces = qty % pkgSize;
      const pkgPrice = Number(p.package_buying_price);
      const piecePrice = Number(p.buying_price || 0);
      totalValue = (packages * pkgPrice) + (extraPieces * piecePrice);
      details = `Pkg Size: ${p.package_size}, Pkg Price: ${p.package_buying_price} (${packages} pkg + ${extraPieces} pcs)`;
    } else {
      totalValue = qty * Number(p.buying_price || 0);
      details = p.is_package ? `Pkg Size: ${p.package_size}, Pkg Price: None` : 'Single Piece';
    }

    return {
      name: p.name,
      qty,
      totalValue,
      isSuspect: false,
      details
    };
  });

  console.log('--- TOP 10 MOST VALUABLE STOCK ITEMS ---');
  analysis
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .forEach(item => {
      console.log(`✅ ${item.name}: ${item.qty} pcs = ${item.totalValue.toLocaleString()} RWF (${item.details})`);
    });

  const total = analysis.reduce((acc, i) => acc + i.totalValue, 0);
  console.log('\nTOTAL CALCULATED STOCK VALUE:', total.toLocaleString(), 'RWF');
}

verify();
