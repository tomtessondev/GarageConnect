# 🚀 Guide de Déploiement sur Vercel

## 📋 Prérequis

- ✅ Compte Vercel (gratuit) : https://vercel.com
- ✅ Base de données PostgreSQL (Neon, Supabase, ou Railway)
- ✅ Compte Stripe configuré
- ✅ Compte Twilio avec WhatsApp configuré
- ✅ Repository GitHub avec le code

## 🎯 Étape 1 : Préparer la Base de Données

### Option A : Neon (Recommandé - Gratuit)

1. Aller sur https://neon.tech
2. Créer un compte gratuit
3. Créer un nouveau projet
4. Copier la `DATABASE_URL` (format: `postgresql://...`)

### Option B : Supabase

1. Aller sur https://supabase.com
2. Créer un projet
3. Aller dans Settings > Database
4. Copier la `Connection String` (mode Direct)

### Option C : Railway

1. Aller sur https://railway.app
2. Créer un nouveau projet
3. Ajouter PostgreSQL
4. Copier la `DATABASE_URL`

## 🚀 Étape 2 : Déployer sur Vercel

### Via l'Interface Web (Recommandé)

1. **Aller sur https://vercel.com**
2. **Cliquer sur "Add New Project"**
3. **Importer votre repository GitHub**
   - Autoriser Vercel à accéder à GitHub
   - Sélectionner le repository `GarageConnect`

4. **Configurer le projet**
   - Framework Preset: `Next.js` (détecté automatiquement)
   - Root Directory: `./` (racine)
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next` (par défaut)

5. **Ajouter les Variables d'Environnement**

Cliquer sur "Environment Variables" et ajouter :

```env
# Base de données
DATABASE_URL=postgresql://user:password@host/database

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# URL de l'application (sera fournie après déploiement)
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

6. **Cliquer sur "Deploy"**

### Via CLI (Alternative)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions
# Répondre aux questions :
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - Project name? garage-connect
# - Directory? ./
# - Override settings? No

# Déployer en production
vercel --prod
```

## 🔧 Étape 3 : Configurer les Variables d'Environnement

### Via Dashboard Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings > Environment Variables**
4. Ajouter chaque variable :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | Production |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` | Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_xxx` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` | Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Production, Preview, Development |
| `TWILIO_ACCOUNT_SID` | `ACxxx` | Production, Preview, Development |
| `TWILIO_AUTH_TOKEN` | `xxx` | Production, Preview, Development |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://preview-xxx.vercel.app` | Preview |

### Via CLI

```bash
# Ajouter une variable
vercel env add DATABASE_URL production

# Lister les variables
vercel env ls

# Supprimer une variable
vercel env rm DATABASE_URL production
```

## 🗄️ Étape 4 : Initialiser la Base de Données

### Méthode 1 : Via Vercel CLI (Recommandé)

```bash
# Se connecter à votre projet
vercel link

# Exécuter les migrations
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### Méthode 2 : Manuellement

1. **Copier votre `DATABASE_URL` de production**
2. **Créer un fichier `.env.production` local**
   ```env
   DATABASE_URL=postgresql://...
   ```
3. **Exécuter les migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 🔗 Étape 5 : Configurer les Webhooks

### Webhook Stripe

1. **Aller sur https://dashboard.stripe.com/webhooks**
2. **Cliquer sur "Add endpoint"**
3. **URL du webhook** : `https://votre-app.vercel.app/api/webhook/stripe`
4. **Événements à écouter** :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. **Copier le "Signing secret"** (commence par `whsec_`)
6. **Ajouter dans Vercel** : `STRIPE_WEBHOOK_SECRET=whsec_xxx`

### Webhook Twilio WhatsApp

1. **Aller sur https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox**
2. **Dans "When a message comes in"**
   - URL : `https://votre-app.vercel.app/api/whatsapp/webhook`
   - Method : `POST`
3. **Sauvegarder**

## ✅ Étape 6 : Vérifier le Déploiement

### Tests à Effectuer

1. **✅ Page d'accueil**
   - Aller sur `https://votre-app.vercel.app`
   - Vérifier que la page se charge

2. **✅ Recherche de pneus**
   - Aller sur `/search`
   - Tester la recherche

3. **✅ Chatbot WhatsApp**
   - Envoyer "menu" sur WhatsApp
   - Vérifier la réponse

4. **✅ Paiement Stripe**
   - Créer une commande test
   - Vérifier le paiement

### Logs et Debugging

```bash
# Voir les logs en temps réel
vercel logs

# Voir les logs d'une fonction spécifique
vercel logs --function=api/whatsapp/webhook

# Voir les logs de build
vercel logs --build
```

## 🔄 Étape 7 : Redéploiement

### Automatique (Recommandé)

Chaque `git push` sur la branche `main` déclenche un déploiement automatique.

```bash
git add .
git commit -m "Update"
git push origin main
```

### Manuel

```bash
# Redéployer
vercel --prod

# Ou via le dashboard
# Aller sur Deployments > Redeploy
```

## 🎯 Étape 8 : Domaine Personnalisé (Optionnel)

1. **Aller dans Settings > Domains**
2. **Ajouter votre domaine** : `garageconnect.gp`
3. **Configurer les DNS** :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Attendre la propagation** (quelques minutes)
5. **Mettre à jour** `NEXT_PUBLIC_APP_URL`

## 📊 Monitoring

### Vercel Analytics

1. Aller dans **Analytics**
2. Activer **Web Analytics** (gratuit)
3. Voir les statistiques en temps réel

### Logs

- **Runtime Logs** : Erreurs et logs de l'application
- **Build Logs** : Logs de compilation
- **Function Logs** : Logs des API routes

## 🚨 Troubleshooting

### Erreur : "Module not found"

```bash
# Vérifier les dépendances
npm install
vercel --prod
```

### Erreur : "Database connection failed"

1. Vérifier `DATABASE_URL` dans Vercel
2. Vérifier que la base de données est accessible
3. Tester la connexion localement

### Erreur : "Webhook signature verification failed"

1. Vérifier `STRIPE_WEBHOOK_SECRET`
2. Recréer le webhook dans Stripe Dashboard
3. Copier le nouveau secret

### Sessions perdues

Les sessions en mémoire sont perdues entre les déploiements. C'est normal avec le système de fichiers `.sessions.json`. En production, les sessions sont recréées automatiquement.

## 💰 Coûts

### Vercel (Hobby - Gratuit)
- ✅ 100 GB bandwidth/mois
- ✅ Déploiements illimités
- ✅ Domaines personnalisés
- ✅ SSL automatique

### Base de Données
- **Neon** : Gratuit (500 MB)
- **Supabase** : Gratuit (500 MB)
- **Railway** : $5/mois

### Stripe
- 1.4% + 0.25€ par transaction (Europe)

### Twilio WhatsApp
- ~$0.005 par message

## 🎉 Félicitations !

Votre application est maintenant en production sur Vercel ! 🚀

**URL de production** : https://votre-app.vercel.app

**Prochaines étapes** :
1. ✅ Tester toutes les fonctionnalités
2. ✅ Configurer un domaine personnalisé
3. ✅ Activer le monitoring
4. ✅ Promouvoir votre service !

## 📞 Support

- **Vercel** : https://vercel.com/support
- **Documentation** : https://vercel.com/docs
- **Discord** : https://vercel.com/discord
