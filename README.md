# 🚀 Github Repo Tracker

Hello Aspire team! 👋 This is pretty backend-focused, so the UI has a bit of tweaking to do. Functionality first!

### ⚙️ Setup

First off, you'll need the following installed, set up, and ready to rock:
- GitHub personal API token (classic is fine)
- Node + NPM
- Docker
- just

*Note: this project can be run manually, but it is recommended to use **just** and Docker for simplicity.*

Now, fork the repo for yourself in the web or cli, then clone it.

### 1. Clone the repo
```bash
# special thanks to my friend and confidant Andrew Bogle
git clone git@github.com:londondavila/takehome_template.git && cd takehome_template && git checkout london/aspire
```

### 2. Set up API token
Need help getting this? Check out this article from GitHub: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

```bash
echo 'GITHUB_TOKEN=your_token_here' > node_server/.env
```

### 3. Run everything
**Recommended** to just use Docker Compose and make life a bit easier for yourself.

```bash
docker compose up -d
```

<details><summary>Manual Setup</summary>

### 3. Initialize and run database
```bash
just docker db
just init db
```

### 4. Run backend server
```bash
just dev node
```

### 5. Run frontend
```bash
just dev react
```
</details>

## Usage
1. Head on over to http://localhost:5173 in your browser.
2. Add repositories by GitHub URL.
3. View, refresh, and delete releases for each repository.

### Troubleshooting

Running into issues? Try the following:
- **Database connection errors**: Ensure Docker is running and the database is initialized
- **GitHub API errors**: Make sure your `GITHUB_TOKEN` is valid and has the necessary selections
- **Port conflicts**: Check and change the ports in `.env` files or `docker-compose.yml` if needed

Also, check out them `console.log` outputs in the Node server window. Those will point you in the right direction.

## 📝 Implementation Details

### ✅ Requirements Fulfilled

#### ✔️ Track Repositories
Users can add GitHub repository URLs to track their updates
- Repository and release data are stored in PostgreSQL
- Add and persistently track GitHub repositories
- Tracked repos can be deleted
  
#### ✔️ Latest Release Details
Display repository name, description, and the latest release version and date.
- Repository name and latest release tag/date are shown in the list and details view

#### ✔️ Mark as Seen
Unseen releases are marked with a "new" chip and a red border
- Users can mark a release as "seen" and vice versa
- Repositories with unseen updates are visually distinct

#### ✔️ Data Reload
Users can manually refresh the repository list to fetch the latest data.
- There is a refresh button on each repository card

### Improvements and trade-offs:
- No authentication or user-specific tracking.
- Better styling, mobile functionality.
- Centralized just script or `docker-compose.yml` for deploying all three components at once (DB, BE, and FE).
- All data is fetched live from GitHub and stored in PostgreSQL. Would be nice to have better testing in the form of a DB entry for "repositories" without any release.
- Further cleanup of repo structure, utils, etc.