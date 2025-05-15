import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

const Repository = ({
  isSelected,
  repo,
  onSelect,
  onRefresh,
  onRemove,
  refreshing,
}) => {
  const hasUnseenRelease = repo.latestRelease && !repo.latestRelease.seen;
  const handleCardClick = () => onSelect(repo);
  const handleRefreshClick = (e) => onRefresh(repo.id, e);
  const handleRemoveClick = (e) => onRemove(repo.id, e);

  return (
    <Card
      key={repo.id}
      sx={{
        mb: 2,
        border: isSelected ? "2px solid" : "1px solid",
        borderColor: hasUnseenRelease
          ? "red"
          : isSelected
          ? "primary.main"
          : "divider",
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {repo.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            {repo.latestRelease
              ? `${repo.latestRelease.tag_name} ${
                  repo.latestRelease.published_at
                    ? `(${repo.latestRelease.published_at.split("T")[0]})`
                    : "(No publish date available)"
                }`
              : "No releases available"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box display="flex" justifyContent="flex-end" p={1}>
        <IconButton
          color="primary"
          onClick={handleRefreshClick}
          aria-label="refresh repository"
          size="small"
          disabled={refreshing}
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={handleRemoveClick}
          aria-label="remove repository"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default Repository;
