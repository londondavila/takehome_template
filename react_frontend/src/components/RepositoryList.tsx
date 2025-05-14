import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  CardActionArea,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation } from "@apollo/client";
import { GET_REPOSITORIES } from "../graphql/queries";
import { REMOVE_REPOSITORY, REFRESH_REPOSITORY } from "../graphql/mutations";
import RepositoryDetails from "./RepositoryDetails";
import RefreshIcon from "@mui/icons-material/Refresh";

const RepositoryList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_REPOSITORIES);
  const [removeRepository] = useMutation(REMOVE_REPOSITORY, {
    refetchQueries: [{ query: GET_REPOSITORIES }], // Refetch repositories after deletion
  });
  const [refreshRepository, { loading: refreshing }] = useMutation(
    REFRESH_REPOSITORY,
    {
      refetchQueries: [{ query: GET_REPOSITORIES }],
    }
  );
  const [selectedRepo, setSelectedRepo] = useState<any>(null);

  const handleSelectRepo = (repo: any) => {
    setSelectedRepo(repo);
  };

  const handleRemoveRepo = async (repoId: string, event: React.MouseEvent) => {
    // prevent click event from bubbling up to the card action area
    event.stopPropagation();

    try {
      await removeRepository({ variables: { id: repoId } });
      // if the deleted repo selected, clear selection
      if (selectedRepo && selectedRepo.id === repoId) {
        setSelectedRepo(null);
      }
    } catch (err) {
      console.error("Error removing repository:", err);
    }
  };

  const handleRefreshRepo = async (repoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await refreshRepository({ variables: { id: repoId } });
    } catch (err) {
      console.error("Error refreshing repository:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h6" color="error">
          Error loading repositories: {error.message}
        </Typography>
      </Box>
    );
  }

  const repositories = data?.repositories || [];

  return (
    <Container maxWidth="lg" disableGutters>
      <Box my={4} display="flex" gap={4}>
        {/* master-detail layout container */}
        <Grid container spacing={3}>
          {/* repository list */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Tracked Repositories
              </Typography>

              {repositories.length === 0 ? (
                <Box textAlign="center" mt={4}>
                  <Typography variant="body1" color="textSecondary">
                    No repositories tracked yet.
                  </Typography>
                </Box>
              ) : (
                <Box mt={2}>
                  {repositories.map((repo: any) => (
                    <Card
                      key={repo.id}
                      sx={{
                        mb: 2,
                        border:
                          selectedRepo?.id === repo.id
                            ? "2px solid"
                            : "1px solid",
                        borderColor: repo.latestRelease
                          ? !repo.latestRelease.seen
                            ? "red"
                            : selectedRepo?.id === repo.id
                            ? "primary.main"
                            : "divider"
                          : // if selected and no latestRelease
                          selectedRepo?.id === repo.id
                          ? "primary.main"
                          : "divider",
                      }}
                    >
                      <CardActionArea onClick={() => handleSelectRepo(repo)}>
                        <CardContent>
                          <Typography variant="h6" component="div" gutterBottom>
                            {repo.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                          >
                            {repo.latestRelease
                              ? `${repo.latestRelease.tag_name} ${
                                  repo.latestRelease.published_at
                                    ? `(${
                                        repo.latestRelease.published_at.split(
                                          "T"
                                        )[0]
                                      })`
                                    : "(No publish date available)"
                                }`
                              : "No releases available"}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <Box display="flex" justifyContent="flex-end" p={1}>
                        <IconButton
                          color="primary"
                          onClick={(e) => handleRefreshRepo(repo.id, e)}
                          aria-label="refresh repository"
                          size="small"
                          disabled={refreshing}
                        >
                          <RefreshIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => handleRemoveRepo(repo.id, e)}
                          aria-label="remove repository"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* repository details - right */}
          <Grid item xs={12} md={7} lg={8}>
            <Paper
              elevation={1}
              sx={{ p: 3, height: "100%", minHeight: "400px" }}
            >
              {selectedRepo ? (
                <RepositoryDetails id={selectedRepo.id} />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  minHeight="300px"
                >
                  <Typography variant="body1" color="textSecondary">
                    Select a repository to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RepositoryList;
