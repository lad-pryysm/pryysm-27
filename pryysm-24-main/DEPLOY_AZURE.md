Azure deployment notes
======================

This project includes a GitHub Actions workflow that builds the inner Next.js project (`pryysm-24-main`) and deploys it to Azure Web App.

Required configuration steps:

1. Create an Azure Web App (Linux) and set Node runtime to Node 22.

2. In the Azure Portal, go to your Web App -> Configuration -> Application settings and add:
   - SCM_DO_BUILD_DURING_DEPLOYMENT = true
   - NPM_CONFIG_PRODUCTION = false
   - WEBSITE_NODE_DEFAULT_VERSION = 22
   - NEXT_TELEMETRY_DISABLED = 1
   - NODE_ENV = production

3. (Optional but recommended) Add Firebase config as App Settings with names:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
   - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

4. Add GitHub Secrets to your repository:
   - AZURE_WEBAPP_PUBLISH_PROFILE: the publish profile XML you download from the Azure Portal (Deployment Center -> Get publish profile)
   - AZURE_WEBAPP_NAME: the name of your web app

5. The included GitHub Action (`.github/workflows/azure-deploy.yml`) will run on pushes to `main`, build the `pryysm-24-main` subfolder, and deploy.

If you prefer Kudu continuous deployment instead of Actions, configure Deployment Center in Azure to point to this repository and branch; Kudu will run install/build using the `.deployment` file already present.
