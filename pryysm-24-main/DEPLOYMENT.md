Azure App Service deployment notes

1. Project layout
   - The app is located in the nested folder `pryysm-24-main`.
   - We added a `.deployment` file at the repository root to point Azure's Kudu to that folder.

2. Node version
   - The `package.json` includes `engines.node: 18.x` to select a supported Node version on Azure App Service.

3. Recommended Azure setup
   - Create an App Service (Linux or Windows).
   - In the App Service > Deployment Center, choose GitHub/Local Git as appropriate and point it to this repo.
   - Ensure the App Service's Node version matches the `engines` field (18.x).
   - Set the build command to `npm install --legacy-peer-deps && npm run build` if you need to adjust install flags.

4. Environment variables
   - Add Firebase and other secrets into App Service > Configuration > Application settings.
   - Example keys: FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, etc.

5. Build output
   - Next.js will produce a `.next` folder during build; Azure will run `npm run build` during deployment.

6. Troubleshooting
   - If Kudu attempts to build the wrong folder, confirm `.deployment` is present at the repository root and contains `project = pryysm-24-main`.
      - If Kudu attempts to build the wrong folder, confirm `.deployment` is present at the repository root and contains `project = pryysm-24-main`.
      - There's a `workspace/` copy inside the project used for local dev snapshots. To avoid accidental route duplication during build, we added `.azureignore` which excludes `workspace/` from Azure deployments. If you use a different CI/CD, ensure `workspace/` is ignored.
   - If builds fail due to peer deps, use `npm install --legacy-peer-deps` in the deployment settings.
