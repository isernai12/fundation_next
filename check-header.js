const http = require('http');

async function check() {
  // We don't need to actually login if we can just look at the HTML structure of the layout on a different page.
  // Wait, if it redirects to /login, does it still render the layout? 
  // No, /login doesn't have the header because it's not logged in!
}
check();
