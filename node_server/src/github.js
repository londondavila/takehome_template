const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function fetchLatestRelease(owner, repo) {
  const { data } = await octokit.repos.getLatestRelease({ owner, repo });
  return {
    tagName: data.tag_name,
    publishedAt: data.published_at,
    notes: data.body,
  };
}

module.exports = { fetchLatestRelease };
