import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

function Header() {
  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          <GitHubIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            GitHub Repo Tracker
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
