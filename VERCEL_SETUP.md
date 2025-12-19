# Vercel Environment Variables Setup 🚀

## UploadThing Configuration

De foto upload werkt niet omdat de UploadThing environment variables ontbreken op Vercel.

### Stappen om op te lossen:

1. **Ga naar je Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Selecteer je project: `liefdevoor`

2. **Ga naar Settings → Environment Variables**

3. **Voeg deze variables toe:**

   Gebruik de waarden uit het lokale `.env` bestand:

   ```
   UPLOADTHING_SECRET=[zie .env file - begint met sk_live_...]
   UPLOADTHING_TOKEN=[zie .env file - begint met eyJhcGlL...]
   ```

   ⚠️ **Belangrijk:** Kopieer de exacte waarden uit je lokale `.env` bestand!

4. **Selecteer environments:** Production, Preview, Development (alle drie)

5. **Save** de wijzigingen

6. **Redeploy je applicatie:**
   - Ga naar Deployments
   - Klik op de laatste deployment
   - Klik op "Redeploy"

   OF gebruik deze snelle link:
   - Ga naar: https://vercel.com/[YOUR-USERNAME]/liefdevoor/settings/environment-variables

## Alternatief: Nieuwe UploadThing App Aanmaken

Als de bovenstaande keys niet werken:

1. Ga naar: https://uploadthing.com/dashboard
2. Log in / maak een account aan
3. Klik "Create new app"
4. Kopieer de nieuwe `UPLOADTHING_SECRET` en `UPLOADTHING_TOKEN`
5. Plak deze in Vercel (stap 3 hierboven)
6. Update ook je lokale `.env` file met de nieuwe keys

## Test na deployment

1. Wacht 1-2 minuten na redeploy
2. Ga naar: https://liefdevoor.vercel.app/profile
3. Probeer een foto te uploaden
4. Het zou nu moeten werken! ✅

## Troubleshooting

Als het nog steeds niet werkt:
- Check de Vercel logs: https://vercel.com/[YOUR-USERNAME]/liefdevoor/logs
- Kijk naar errors in de browser console (F12)
- Verify dat alle env variables zijn ingesteld (geen typos!)
