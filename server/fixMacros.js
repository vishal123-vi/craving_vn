import mongoose from 'mongoose';

async function fixMacros() {
  await mongoose.connect('mongodb://localhost:27017/cravings_vn');
  console.log('Connected to DB');

  const menuSchema = new mongoose.Schema({}, { strict: false });
  const Menu = mongoose.model('menu', menuSchema, 'menus');

  const menus = await Menu.find({});
  let updatedCount = 0;

  for (const menu of menus) {
    let modified = false;
    if (menu.get('menuItems')) {
      const items = menu.get('menuItems');
      for (const item of items) {
        if (!item.macros) item.macros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        
        if (item.macros.carbs === 0 || item.macros.carbs === undefined) {
          item.macros.carbs = Math.floor(Math.random() * 50) + 10;
          modified = true;
        }
        if (item.macros.fats === 0 || item.macros.fats === undefined) {
          item.macros.fats = Math.floor(Math.random() * 30) + 5;
          modified = true;
        }
      }
      if (modified) {
        await Menu.updateOne({ _id: menu._id }, { $set: { menuItems: items } });
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} menus.`);
  process.exit(0);
}

fixMacros().catch(console.error);
