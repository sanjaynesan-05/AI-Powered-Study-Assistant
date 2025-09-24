require('dotenv').config();

// Removed Google OAuth setup checker
// const { OAuth2Client } = require('google-auth-library');
// async function checkGoogleOAuthSetup() {
//   try {
//     console.log('\n===== Google OAuth Setup Checker =====\n');
//     
//     const clientId = process.env.GOOGLE_CLIENT_ID;
//     
//     if (!clientId) {
//       console.error('❌ GOOGLE_CLIENT_ID not found in environment variables!');
//       return;
//     }
//     
//     console.log(`✅ GOOGLE_CLIENT_ID found: ${clientId.substring(0, 12)}...`);
//     console.log('\n🔍 This ID should be configured in Google Cloud Console with:');
//     console.log('   - Authorized JavaScript origins that include:');
//     console.log('     * http://localhost:5173 (Vite dev server)');
//     console.log('     * http://localhost:5000 (API server, if used as origin)');
//     
//     // Try to create a Google OAuth client as a basic check
//     try {
//       const client = new OAuth2Client(clientId);
//       console.log('\n✅ Successfully created OAuth2Client instance');
//     } catch (err) {
//       console.error('\n❌ Failed to create OAuth2Client:', err.message);
//     }
//     
//     console.log('\n===== Next Steps =====');
//     console.log('1. Go to https://console.cloud.google.com/apis/credentials');
//     console.log('2. Edit your OAuth client ID');
//     console.log('3. Add "http://localhost:5173" to "Authorized JavaScript origins"');
//     console.log('4. Save changes and wait a few minutes for them to propagate\n');
//     
//   } catch (error) {
//     console.error('Error checking Google OAuth setup:', error);
//   }
// }
// checkGoogleOAuthSetup();
