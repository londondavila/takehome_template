import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { GET_REPOSITORIES } from "../graphql/queries";
import { REMOVE_REPOSITORY, REFRESH_REPOSITORY } from "../graphql/mutations";
import RepositoryDetails from "./RepositoryDetails";
import Repository from "./Repository";

function RepositoryList() {
  const { loading, error, data } = useQuery(GET_REPOSITORIES);
  const [removeRepository] = useMutation(REMOVE_REPOSITORY, {
    refetchQueries: [{ query: GET_REPOSITORIES }],
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
    event.stopPropagation();

    try {
      await removeRepository({ variables: { id: repoId } });
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
        <Grid container spacing={3}>
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
                    <Repository
                      key={repo.id}
                      repo={repo}
                      isSelected={selectedRepo?.id === repo.id}
                      onSelect={handleSelectRepo}
                      onRefresh={handleRefreshRepo}
                      onRemove={handleRemoveRepo}
                      refreshing={refreshing}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
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
}

export default RepositoryList;
