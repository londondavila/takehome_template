function parseGitHubUrl(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

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
