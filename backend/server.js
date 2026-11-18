import express from "express";
import cors from "cors";
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "eco-assistant.sqlite");
const SQL = await initSqlJs();
const db = fs.existsSync(DB_FILE) ? new SQL.Database(fs.readFileSync(DB_FILE)) : new SQL.Database();

db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, eco_score TEXT,
  description TEXT, materials TEXT, eco_data_available INTEGER
)`);
db.run(`CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER UNIQUE,
  FOREIGN KEY(product_id) REFERENCES products(id)
)`);

// Indexes help the database filter products efficiently by grade, price and category.
db.run("CREATE INDEX IF NOT EXISTS idx_products_eco_score ON products(eco_score)");
db.run("CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)");
db.run("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)");

// Seed demonstration catalogue on every startup using INSERT OR IGNORE.
// Existing records are preserved; missing new records are added automatically.
const seed = [
  [1,"Organic Cotton Tote Bag","Accessories",12.99,"A","Reusable bag made with organic cotton; sample score for demonstration.","Organic cotton",1],
  [2,"Recycled Plastic Water Bottle","Home",18.50,"B","Reusable bottle made with recycled plastic; sample score.","Recycled plastic",1],
  [3,"Bamboo Toothbrush Set","Personal Care",7.25,"A","Bamboo-handle toothbrush set with reduced-plastic packaging; sample score.","Bamboo",1],
  [4,"Conventional Polyester T-Shirt","Clothing",15.00,"D","Conventional synthetic-fibre shirt; sample score.","Polyester",1],
  [5,"Vegan Leather Backpack","Accessories",49.00,"C","Synthetic alternative backpack; lifecycle information is limited; sample score.","Synthetic materials",1],
  [6,"Wireless Earbuds","Electronics",39.99,"F","Eco-impact information has not been supplied. F is a provisional placeholder, not a verified rating.","Not specified",0],
  [7,"Recycled Paper Notebook","Stationery",5.50,"A","Notebook made from recycled paper; sample score.","Recycled paper",1],
  [8,"Standard Ceramic Mug","Home",9.99,"C","Reusable ceramic mug; sample score.","Ceramic",1],
  [9,"Solar Power Bank","Electronics",34.99,"B","Portable charger with a solar charging panel; sample score.","Electronics and solar panel",1],
  [10,"Hemp Fabric Shirt","Clothing",28.00,"A","Shirt made using hemp fibre; sample score.","Hemp",1],
  [11,"Reusable Stainless Steel Straw Set","Kitchen",8.49,"A","Reusable straws intended to replace disposable straws; sample score.","Stainless steel",1],
  [12,"Compostable Garbage Bags","Home",11.25,"B","Compostable bags; certification should be checked before purchase.","Compostable bioplastic",1],
  [13,"Recycled Denim Jeans","Clothing",42.00,"B","Denim made partly from recycled fibres; sample score.","Recycled cotton blend",1],
  [14,"LED Energy-Saving Bulb","Home",6.99,"A","LED bulb designed to use less electricity than traditional bulbs; sample score.","LED components",1],
  [15,"Conventional Plastic Lunch Box","Kitchen",10.50,"D","Standard plastic lunch container; sample score.","Plastic",1],
  [16,"Cork Yoga Mat","Sports & Fitness",32.00,"B","Yoga mat using cork surface material; sample score.","Cork and natural rubber",1],
  [17,"Organic Cotton Bedsheet Set","Home",55.00,"A","Bedsheet set made from organic cotton; sample score.","Organic cotton",1],
  [18,"Bamboo Desk Organizer","Stationery",16.75,"B","Desk organizer made primarily from bamboo; sample score.","Bamboo",1],
  [19,"Fast-Fashion Acrylic Scarf","Clothing",9.50,"E","Low-cost acrylic scarf; sample score.","Acrylic",1],
  [20,"Refillable Glass Soap Dispenser","Personal Care",14.25,"A","Refillable glass dispenser intended to reduce single-use packaging; sample score.","Glass and metal pump",1],
  [21,"Unknown-Source Leather Wallet","Accessories",24.00,"F","Supplier has not provided sustainability evidence. F is a provisional placeholder, not a verified rating.","Leather; source not provided",0],
  [22,"Recycled PET Backpack","Accessories",38.50,"B","Backpack made using recycled PET fabric; sample score.","Recycled PET",1],
  [23,"Reusable Silicone Food Bags","Kitchen",13.99,"C","Reusable food storage bags; end-of-life information is limited; sample score.","Silicone",1],
  [24,"Bamboo Fiber Plate Set","Kitchen",19.99,"C","Bamboo-fibre composite tableware; composition and disposal details should be checked.","Bamboo-fibre composite",1]
];
const seedStmt = db.prepare("INSERT OR IGNORE INTO products VALUES (?,?,?,?,?,?,?,?)");
for (const product of seed) seedStmt.run(product);
seedStmt.free();
// Correct the original missing-data demo item if this database was created by an earlier ZIP.
db.run("UPDATE products SET eco_score='F', description='Eco-impact information has not been supplied. F is a provisional placeholder, not a verified rating.' WHERE id=6 AND eco_data_available=0");
function save(){ fs.writeFileSync(DB_FILE, Buffer.from(db.export())); }
save();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_,res)=>res.json({status:"ok"}));
app.get("/api/products", (req,res)=>{
  const {q,category,score,maxPrice} = req.query;
  const conditions=[];
  const params=[];
  if(q){ conditions.push("LOWER(name) LIKE ?"); params.push(`%${String(q).toLowerCase()}%`); }
  if(category && category!=="All"){ conditions.push("category = ?"); params.push(category); }
  if(score && score!=="All"){ conditions.push("eco_score = ?"); params.push(score); }
  if(maxPrice!==undefined && maxPrice!=="" && Number.isFinite(Number(maxPrice))){ conditions.push("price <= ?"); params.push(Number(maxPrice)); }
  const sql=`SELECT * FROM products ${conditions.length?"WHERE "+conditions.join(" AND "):""} ORDER BY id`;
  const stmt=db.prepare(sql);
  stmt.bind(params);
  const products=[];
  while(stmt.step()){
    const r=stmt.get();
    products.push({id:r[0],name:r[1],category:r[2],price:r[3],ecoScore:r[4],description:r[5],materials:r[6],ecoDataAvailable:!!r[7]});
  }
  stmt.free();
  res.json(products);
});
app.get("/api/wishlist", (_,res)=>{
  const rows=db.exec("SELECT p.* FROM products p JOIN wishlist w ON p.id=w.product_id")[0]?.values||[];
  res.json(rows.map(r=>({id:r[0],name:r[1],category:r[2],price:r[3],ecoScore:r[4],description:r[5],materials:r[6],ecoDataAvailable:!!r[7]})));
});
app.post("/api/wishlist/:id", (req,res)=>{
  try { db.run("INSERT OR IGNORE INTO wishlist(product_id) VALUES (?)",[Number(req.params.id)]); save(); res.json({ok:true}); }
  catch(e){res.status(400).json({error:e.message});}
});
app.delete("/api/wishlist/:id", (req,res)=>{
  db.run("DELETE FROM wishlist WHERE product_id=?",[Number(req.params.id)]); save(); res.json({ok:true});
});
app.listen(5000,()=>console.log("Backend running at http://localhost:5000"));
