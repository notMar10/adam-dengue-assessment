# A.D.A.M — Static site (Vercel)

**Standalone project** — no CodeIgniter, no PHP, no XAMPP.

HTML + CSS + JavaScript only. Same design and scoring as the main app.

## This folder is independent

You can:

- Move this folder anywhere on your PC
- Use it as its **own GitHub repository**
- Deploy on Vercel without the PHP project

It does **not** need files from `adam/` (CodeIgniter).

## Deploy on Vercel

1. Create a new GitHub repo (e.g. `adam-dengue-vercel`) and push **this folder’s contents** (not the parent `adam` folder).
2. On [vercel.com](https://vercel.com) → **Add New Project** → import that repo.
3. **Root Directory:** leave blank (`.`).
4. No build command. Deploy.

## Local preview

```powershell
cd c:\xampp\htdocs\adam-dengue-vercel
npx serve .
```

## Dedication photo

Add `assets/images/adam.jpg` — optional. Placeholder shows if missing.

## PHP version

The full CodeIgniter app lives separately at `c:\xampp\htdocs\adam` (XAMPP).
