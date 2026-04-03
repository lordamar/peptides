import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get category IDs
const { data: categories } = await supabase
  .from('product_categories')
  .select('id, slug');

const categoryMap = {
  'weight-management': categories.find(c => c.slug === 'weight-management')?.id,
  'healing-recovery': categories.find(c => c.slug === 'healing-recovery')?.id,
  'growth-factors': categories.find(c => c.slug === 'growth-factors')?.id,
  'cosmetic-peptides': categories.find(c => c.slug === 'cosmetic-peptides')?.id,
  'specialized-research': categories.find(c => c.slug === 'specialized-research')?.id,
  'accessories': categories.find(c => c.slug === 'accessories')?.id,
};

function getCategoryForProduct(sku, name) {
  const nameUpper = name.toUpperCase();

  if (nameUpper.includes('SEMAGLUTIDE') || nameUpper.includes('TIRZEPATIDE') ||
      nameUpper.includes('RETATRUTIDE') || nameUpper.includes('CAGRILINTIDE') ||
      nameUpper.includes('MAZDUTIDE') || nameUpper.includes('SURVODUTIDE')) {
    return categoryMap['weight-management'];
  }

  if (nameUpper.includes('BPC') || nameUpper.includes('TB') || nameUpper.includes('TB500')) {
    return categoryMap['healing-recovery'];
  }

  if (nameUpper.includes('CJC') || nameUpper.includes('IPAMORELIN') ||
      nameUpper.includes('HGH') || nameUpper.includes('IGF') ||
      nameUpper.includes('GHRP') || nameUpper.includes('HCG')) {
    return categoryMap['growth-factors'];
  }

  if (nameUpper.includes('GHK-CU') || nameUpper.includes('MELANOTAN') ||
      nameUpper.includes('MT-2') || nameUpper.includes('BOTOX')) {
    return categoryMap['cosmetic-peptides'];
  }

  if (nameUpper.includes('WATER') || nameUpper.includes('BAC')) {
    return categoryMap['accessories'];
  }

  return categoryMap['specialized-research'];
}

const products = [
  { sku: 'SM05', name: 'Semaglutide', spec: '5mg*10vials', cost: 45.6, sell: 54.72 },
  { sku: 'SM10', name: 'Semaglutide', spec: '10mg*10vials', cost: 66, sell: 79.2 },
  { sku: 'SM15', name: 'Semaglutide', spec: '15mg*10vials', cost: 81.6, sell: 97.92 },
  { sku: 'SM20', name: 'Semaglutide', spec: '20mg*10vials', cost: 103.2, sell: 123.84 },
  { sku: 'SM30', name: 'Semaglutide', spec: '30mg*10vials', cost: 138, sell: 165.6 },
  { sku: 'TR5', name: 'Tirzepatide', spec: '5mg*10vials', cost: 48, sell: 57.6 },
  { sku: 'TR10', name: 'Tirzepatide', spec: '10mg*10vials', cost: 69.6, sell: 83.52 },
  { sku: 'TR15', name: 'Tirzepatide', spec: '15mg*10vials', cost: 96, sell: 115.2 },
  { sku: 'TR20', name: 'Tirzepatide', spec: '20mg*10vials', cost: 114, sell: 136.8 },
  { sku: 'TR30', name: 'Tirzepatide', spec: '30mg*10vials', cost: 144, sell: 172.8 },
  { sku: 'TR40', name: 'Tirzepatide', spec: '40mg*10vials', cost: 186, sell: 223.2 },
  { sku: 'TR50', name: 'Tirzepatide', spec: '50mg*10vials', cost: 228, sell: 273.6 },
  { sku: 'TR60', name: 'Tirzepatide', spec: '60mg*10vials', cost: 270, sell: 324 },
  { sku: 'RT5', name: 'Retatrutide', spec: '5mg*10vials', cost: 78, sell: 93.6 },
  { sku: 'RT10', name: 'Retatrutide', spec: '10mg*10vials', cost: 120, sell: 144 },
  { sku: 'RT15', name: 'Retatrutide', spec: '15mg*10vials', cost: 156, sell: 187.2 },
  { sku: 'RT20', name: 'Retatrutide', spec: '20mg*10vials', cost: 192, sell: 230.4 },
  { sku: 'RT30', name: 'Retatrutide', spec: '30mg*10vials', cost: 264, sell: 316.8 },
  { sku: 'RT40', name: 'Retatrutide', spec: '40mg*10vials', cost: 318, sell: 381.6 },
  { sku: 'RT50', name: 'Retatrutide', spec: '50mg*10vials', cost: 378, sell: 453.6 },
  { sku: 'RT60', name: 'Retatrutide', spec: '60mg*10vials', cost: 432, sell: 518.4 },
  { sku: 'CGL5', name: 'Cagrilintide', spec: '5mg*10vials', cost: 139.2, sell: 167.04 },
  { sku: 'CGL10', name: 'Cagrilintide', spec: '10mg*10vials', cost: 223.2, sell: 267.84 },
  { sku: 'MDT5', name: 'Mazdutide', spec: '5mg*10vials', cost: 156, sell: 187.2 },
  { sku: 'MDT10', name: 'Mazdutide', spec: '10mg*10vials', cost: 264, sell: 316.8 },
  { sku: 'BC5', name: 'BPC 157', spec: '5mg*10vials', cost: 50.4, sell: 60.48 },
  { sku: 'BC10', name: 'BPC 157', spec: '10mg*10vials', cost: 73.2, sell: 87.84 },
  { sku: 'BT5', name: 'TB 500', spec: '5mg*10vials', cost: 102, sell: 122.4 },
  { sku: 'BT10', name: 'TB 500', spec: '10mg*10vials', cost: 177.6, sell: 213.12 },
  { sku: 'BB10', name: 'BPC5+TB5', spec: '10mg*10vials', cost: 132, sell: 158.4 },
  { sku: 'BB20', name: 'BPC10+TB10', spec: '20mg*10vials', cost: 252, sell: 302.4 },
  { sku: 'CU50', name: 'GHK-CU', spec: '50mg*10vials', cost: 42, sell: 50.4 },
  { sku: 'CU100', name: 'GHK-CU', spec: '100mg*10vials', cost: 50.4, sell: 60.48 },
  { sku: 'ML10', name: 'MT-2 (Melanotan 2 Acetate)', spec: '10mg*10vials', cost: 60, sell: 72 },
  { sku: 'CND5', name: 'CJC-1295 Without DAC', spec: '5mg*10vials', cost: 99.6, sell: 119.52 },
  { sku: 'CD5', name: 'CJC-1295 With DAC', spec: '5mg*10vials', cost: 192, sell: 230.4 },
  { sku: 'IP5', name: 'Ipamorelin', spec: '5mg*10vials', cost: 57.6, sell: 69.12 },
  { sku: 'IP10', name: 'Ipamorelin', spec: '10mg*10vials', cost: 102, sell: 122.4 },
  { sku: 'CP10', name: 'CJC-1295 Without DAC 5mg + Ipamorelin 5mg', spec: '10mg*10vials', cost: 138, sell: 165.6 },
  { sku: '5AD', name: 'AOD9604', spec: '5mg*10vials', cost: 138, sell: 165.6 },
  { sku: 'P41', name: 'PT-141', spec: '10mg*10vials', cost: 78, sell: 93.6 },
  { sku: 'WA3', name: 'Bacteriostatic Water', spec: '3ml*10vials', cost: 9.6, sell: 11.52 },
  { sku: 'WA10', name: 'Bacteriostatic Water', spec: '10ml*10vials', cost: 12, sell: 14.4 },
];

for (const product of products) {
  const { error } = await supabase
    .from('products')
    .insert({
      sku: product.sku,
      product_name: product.name,
      specification: product.spec,
      cost_price: product.cost,
      sell_price: product.sell,
      category_id: getCategoryForProduct(product.sku, product.name),
      description: `Research-grade ${product.name} for qualified researchers only. Not for human consumption.`,
      research_applications: `${product.name} is used in various research applications. Consult scientific literature for specific protocols.`,
      storage_requirements: 'Store at -20°C. Protect from light. Keep in original packaging until ready to use.',
      reconstitution_guide: 'Reconstitute with bacteriostatic water. Use aseptic technique. Consult protocol documentation for specific ratios.',
      stock_quantity: 100,
      is_active: true
    });

  if (error) {
    console.error(`Error inserting ${product.sku}:`, error);
  } else {
    console.log(`Inserted ${product.sku} - ${product.name}`);
  }
}

console.log('Product import complete!');
