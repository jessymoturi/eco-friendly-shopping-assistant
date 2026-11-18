# Eco-Friendly Shopping Assistant (EcoCart)

A full-stack FSD demonstration website built with React, Vite, Node.js, Express and SQLite (using sql.js).

## 1. Requirements
- Windows 10/11, macOS or Linux
- Node.js 18 or later and npm
- VS Code (recommended)
- Internet connection for the first dependency installation; the app runs locally afterward

## 2. Install and run on Windows
1. Extract the ZIP file.
2. Open the inner `EcoFriendlyShoppingAssistant` folder in VS Code (the folder that contains the root `package.json`).
3. Open **Terminal → New Terminal**. Confirm the prompt ends in `\EcoFriendlyShoppingAssistant`.
4. Install all packages once:

   ```powershell
   npm run install:all
   ```

5. Start the frontend and backend together:

   ```powershell
   npm run dev
   ```

6. Keep the terminal open and visit **http://localhost:5173** in Chrome or Edge.
7. To stop the app, return to the terminal and press `Ctrl + C`.

The React website runs on port 5173. The Express API runs on port 5000. The SQLite database is automatically created at `backend/eco-assistant.sqlite`.

## 3. Products included
The starter catalogue contains 24 sample products across Accessories, Clothing, Electronics, Home, Kitchen, Personal Care, Sports & Fitness and Stationery. Examples include Organic Cotton Tote Bag (A), Recycled Plastic Water Bottle (B), Bamboo Toothbrush Set (A), Polyester T-Shirt (D), Solar Power Bank (B), LED Energy-Saving Bulb (A), and Wireless Earbuds (provisional F because supplier eco-data is missing).

**Important scoring note:** A–F values in this student demonstration are illustrative sample ratings, not certified or independently verified environmental scores. For the two products with missing supplier information, F is only a provisional placeholder to satisfy the A–F field requirement; the card also explicitly says “Eco-data unavailable”. Do not describe these as independently assessed ratings.

## 4. How to use the website
### Shop / product catalogue
- The Shop page opens by default and displays product cards, prices, categories, materials and eco-score labels.
- Type a product name in **Search products** to find it.
- Choose a category, an A–F eco-score, and/or a maximum price in the left filter panel. Filters can be combined.
- Click **Clear filters** to show the full catalogue again.

### Wishlist
- Click **＋ Wishlist** on a product card.
- Select **Wishlist** in the top navigation to see saved products.
- Click **Remove** to delete a saved product.
- Wishlist entries are stored in the SQLite database and remain after restarting the app.

### Compare products
- On the Shop page, tick **Add to compare** for two, three, four or five different products.
- Click **Compare** in the top navigation.
- The comparison table displays eco-score, price, category, materials and eco-data availability side by side.
- Untick a product on the Shop page to remove it from the comparison selection.
- A sixth product cannot be selected.

### Missing eco-data
- Products without supplier sustainability information display **Eco-data unavailable**.
- Their F score is marked **provisional**; it is not a verified environmental rating.

## 5. Backend API
- `GET http://localhost:5000/api/health` — confirms the API is running.
- `GET http://localhost:5000/api/products` — lists products.
- `GET /api/products?score=A` — filters by eco-score in SQLite.
- `GET /api/products?category=Home` — filters by category in SQLite.
- `GET /api/products?maxPrice=20` — filters by maximum price in SQLite.
- Filters can be combined, e.g. `/api/products?category=Home&score=A&maxPrice=20`.
- `GET /api/wishlist` — reads saved products.
- `POST /api/wishlist/:id` — saves a product.
- `DELETE /api/wishlist/:id` — removes a saved product.

SQLite indexes are created for `eco_score`, `price` and `category`.

## 6. Test cases (manual functional testing)
Run the app first. For each test, perform the action and compare the actual result with the expected result.

| ID | Test scenario / steps | Expected result |
|---|---|---|
| TC01 | Open `http://localhost:5173` while both servers are running. | EcoCart Shop page loads without a blank screen. |
| TC02 | Check the product catalogue. | 24 sample products are displayed. |
| TC03 | Search for `Bamboo Toothbrush`. | Bamboo Toothbrush Set is shown; unrelated products are hidden. |
| TC04 | Search for a name that does not exist. | No product cards are shown. |
| TC05 | Set Category to `Home`. | Only Home products are shown. |
| TC06 | Set Eco-score to `A`. | Only A-grade products are shown. |
| TC07 | Set maximum price to `10`. | Only products priced at or below $10 are shown. |
| TC08 | Combine Category `Home`, score `A`, and maximum price `20`. | Only products satisfying all three conditions are shown. |
| TC09 | Click Clear filters. | Search and all filters reset; full catalogue returns. |
| TC10 | Inspect product cards. | Each product has an A–F text score; missing-data products also show “Eco-data unavailable”. |
| TC11 | Add one product to Wishlist. | Success message appears and wishlist count increases. |
| TC12 | Open Wishlist. | The saved product appears with its name and price. |
| TC13 | Refresh the browser. | Previously saved wishlist item remains. |
| TC14 | Remove a wishlist product. | Product disappears and wishlist count decreases. |
| TC15 | Select one product for comparison and open Compare. | Guidance says at least two products are needed. |
| TC16 | Select two products and open Compare. | A comparison table appears with both products. |
| TC17 | Select three, four and five products. | All selected products appear in the comparison table. |
| TC18 | Try selecting a sixth product. | Sixth selection is prevented and a maximum-five message appears. |
| TC19 | Untick a selected product. | It is removed from the comparison selection. |
| TC20 | Compare a product with missing eco-data. | Table shows provisional F and eco-data unavailable status. |
| TC21 | Open the website on a narrow/mobile-sized browser window. | Cards stack into a readable single-column layout; navigation remains usable. |
| TC22 | Use filters on a narrow window. | Filter panel is visible and usable; no horizontal page overflow should occur. |
| TC23 | Open `http://localhost:5000/api/health`. | JSON response contains `status: ok`. |
| TC24 | Open `http://localhost:5000/api/products?score=A`. | API returns only A-score products. |
| TC25 | Open `http://localhost:5000/api/products?category=Home&maxPrice=20`. | API returns Home products costing no more than $20. |
| TC26 | Stop and restart the backend, then reopen Wishlist. | Wishlist data remains stored in the SQLite file. |
| TC27 | Stop the servers with Ctrl+C and try loading the page. | The site/API is unavailable; restart with `npm run dev`. |

## 7. Troubleshooting
- **ENOENT package.json:** You are in the outer extraction folder. Run `Get-ChildItem -Recurse -Filter package.json` and `cd` into the folder containing the root `package.json`.
- **Port already in use:** Close the earlier terminal running the app, or stop its process before starting again.
- **Backend not running message:** Ensure `npm run dev` starts both the backend (port 5000) and Vite (port 5173).
- **Missing modules:** Run `npm run install:all` from the root project folder.

## 8. Project structure
```text
EcoFriendlyShoppingAssistant/
  package.json
  backend/
    package.json
    server.js
  frontend/
    package.json
    index.html
    vite.config.js
    src/
      App.jsx
      main.jsx
      style.css
  README.md
```
