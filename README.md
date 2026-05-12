# Thiep moi PTIT

Next.js app quan ly va hien thi thiep moi tot nghiep.

## Data storage

Mac dinh app dung JSON local:

```env
STORAGE_DRIVER=local
```

Du lieu nam trong `data/local-invites.json`. File nay bi ignore khoi Git de tranh day nham data rieng len repo.

Neu muon quay lai Supabase sau nay, doi:

```env
STORAGE_DRIVER=supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Sau do chay SQL trong `supabase/schema.sql`.

## Local

```bash
npm ci
npm run dev
```

## Production

```bash
cp .env.example .env
nano .env
npm ci
npm run build
npm run pm2:start
pm2 save
```

Khi cap nhat code tren server:

```bash
git pull
npm ci
npm run build
npm run pm2:restart
```
