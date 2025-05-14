// function parseGitHubUrl(url) {
//   const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
//   if (!match) {
//     throw new Error("Invalid GitHub URL");
//   }
//   console.log("Parsed GitHub URL:", match);
//   return { owner: match[1], name: match[2] };
// }

// module.exports = { parseGitHubUrl };

// Utility function to parse GitHub URLs into owner and repo name
function parseGitHubUrl(url) {
  // Remove trailing slash if present
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  // Handle various GitHub URL formats
  let match;

  // Format: https://github.com/owner/repo
  match = url.match(/github\.com\/([^\/]+)\/([^\/]+)$/i);
  if (match) {
    return {
      owner: match[1],
      name: match[2],
    };
  }

  // Format: git@github.com:owner/repo.git
  match = url.match(/github\.com[:|\/]([^\/]+)\/([^\/\.]+)(\.git)?$/i);
  if (match) {
    return {
      owner: match[1],
      name: match[2],
    };
  }

  throw new Error(`Invalid GitHub URL: ${url}`);
}

module.exports = { parseGitHubUrl };
