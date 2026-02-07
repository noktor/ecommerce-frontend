# 🚀 Instruccions per pujar el projecte a GitHub

## 1. Crear el repositori a GitHub

1. Ves a https://github.com/new
2. Omple els camps:
   - **Repository name**: `ecommerce-frontend`
   - **Description**: "E-commerce frontend built with React, TypeScript, and Vite"
   - **Visibility**: Públic o Privat (segons prefereixis)
   - **NO marquis**: Add README, Add .gitignore, o Choose a license (ja els tenim)
3. Clica "Create repository"

## 2. Connectar el repositori local amb GitHub

Després de crear el repositori, executa aquestes comandes (substitueix `TU_USUARI` pel teu nom d'usuari de GitHub):

```bash
git remote add origin https://github.com/TU_USUARI/ecommerce-frontend.git
git branch -M main
git push -u origin main
```

## 3. Alternativa: Usant SSH

Si prefereixes usar SSH (requereix configuració prèvia):

```bash
git remote add origin git@github.com:TU_USUARI/ecommerce-frontend.git
git branch -M main
git push -u origin main
```

## 4. Verificar

Després del push, refresca la pàgina del repositori a GitHub i hauràs de veure tots els fitxers.

## 📝 Notes

- El workflow de CI/CD (`.github/workflows/ci.yml`) s'activarà automàticament quan facis push
- Recorda configurar els secrets a GitHub si vols usar les variables d'entorn:
  - `PREVIEW_API_URL` (per preview deployments)
  - `PROD_API_URL` (per producció)

