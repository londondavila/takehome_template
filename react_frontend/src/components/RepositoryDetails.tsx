import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_REPOSITORY_DETAILS, GET_LATEST_RELEASE } from "../graphql/queries";
import { TOGGLE_RELEASE_SEEN } from "../graphql/mutations";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Link,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import TagIcon from "@mui/icons-material/LocalOffer";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { format } from "date-fns";

interface RepositoryDetailsProps {
  id: string;
}

const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ id }) => {
  // const { loading, error, data } = useQuery(GET_REPOSITORY_DETAILS, {
  const { loading, error, data } = useQuery(GET_LATEST_RELEASE, {
    variables: { id },
    skip: !id,
  });

  const [toggleReleaseSeen] = useMutation(TOGGLE_RELEASE_SEEN);

  const handleToggleSeen = async (releaseId: string, currentSeen: boolean) => {
    try {
      await toggleReleaseSeen({
        variables: { id: releaseId, seen: !currentSeen },
        optimisticResponse: {
          toggleReleaseSeen: {
            id: releaseId,
            seen: !currentSeen,
            __typename: "Release",
          },
        },
        update: (cache, { data: { toggleReleaseSeen } }) => {
          const existingData = cache.readQuery({
            // query: GET_REPOSITORY_DETAILS,
            query: GET_LATEST_RELEASE,
            variables: { id },
          });

          // if (existingData) {
          //   const updatedReleases = existingData.repository.releases.map(
          //     (release: any) =>
          //       release.id === toggleReleaseSeen.id
          //         ? { ...release, seen: toggleReleaseSeen.seen }
          //         : release
          //   );

          //   cache.writeQuery({
          //     query: GET_REPOSITORY_DETAILS,
          //     variables: { id },
          //     data: {
          //       repository: {
          //         ...existingData.repository,
          //         releases: updatedReleases,
          //       },
          //     },
          //   });
          // }
          if (existingData) {
            cache.writeQuery({
              query: GET_LATEST_RELEASE,
              variables: { id },
              data: {
                repository: {
                  ...existingData.repository,
                  latestRelease: {
                    ...existingData.repository.latestRelease,
                    seen: toggleReleaseSeen.seen,
                  },
                },
              },
            });
          }
        },
      });
    } catch (error) {
      console.error("Error toggling release seen status:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body1" color="error">
          Error loading repository details: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!data?.repository) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          Repository not found
        </Typography>
      </Box>
    );
  }

  const repository = data.repository;
  const latestRelease = repository.latestRelease;

  return (
    <Box>
      {/* Repository Header */}
      <Box mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          {repository.name}
        </Typography>

        {/* <Typography variant="body1" color="textSecondary" paragraph>
          {repository.description}
        </Typography> */}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Repository Stats */}
      {/* <Box
        display="flex"
        gap={3}
        mb={3}
        sx={{
          "& .stat-item": {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        {repository.stars !== undefined && (
          <Box className="stat-item">
            <Typography variant="h6">{repository.stars}</Typography>
            <Typography variant="body2" color="textSecondary">
              Stars
            </Typography>
          </Box>
        )}

        {repository.forks !== undefined && (
          <Box className="stat-item">
            <Typography variant="h6">{repository.forks}</Typography>
            <Typography variant="body2" color="textSecondary">
              Forks
            </Typography>
          </Box>
        )}

        {repository.watchers !== undefined && (
          <Box className="stat-item">
            <Typography variant="h6">{repository.watchers}</Typography>
            <Typography variant="body2" color="textSecondary">
              Watchers
            </Typography>
          </Box>
        )}
      </Box> */}

      {/* Releases Section */}
      <Typography variant="h6" gutterBottom>
        Releases
      </Typography>

      {/* {repository.releases && repository.releases.length > 0 ? (
        <Grid container spacing={2}>
          {repository.releases.map((release) => (
            <Grid item xs={12} key={release.id}>
              <Card
                variant="outlined"
                sx={{
                  borderLeft: !release.seen ? "4px solid #f50057" : "inherit",
                  bgcolor: !release.seen ? "rgba(245, 0, 87, 0.05)" : "inherit",
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6">
                      {release.name || release.tag_name}
                    </Typography>

                    {!release.seen && (
                      <Chip label="New" color="secondary" size="small" />
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleToggleSeen(release.id, release.seen)}
                    >
                      {release.seen ? "Mark as Unseen" : "Mark as Seen"}
                    </Button>

                  </Box>

                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <TagIcon fontSize="small" />
                    <Chip
                      label={release.tag_name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />

                    {release.published_at && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 2 }}
                      >
                        <DateRangeIcon fontSize="small" />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ ml: 0.5 }}
                        >
                          {format(
                            new Date(release.published_at),
                            "MMM d, yyyy"
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {release.body && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        overflowX: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {release.body}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid> */}

      {/* Latest Release Section */}
      <Typography variant="h6" gutterBottom>
        Latest Release
      </Typography>

      {latestRelease ? (
        <Card
          variant="outlined"
          sx={{
            borderLeft: !latestRelease.seen ? "4px solid #f50057" : "inherit",
            bgcolor: !latestRelease.seen ? "rgba(245, 0, 87, 0.05)" : "inherit",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="h6">
                {latestRelease.name || latestRelease.tag_name}
              </Typography>

              {!latestRelease.seen && (
                <Chip label="New" color="secondary" size="small" />
              )}

              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleToggleSeen(latestRelease.id, latestRelease.seen)
                }
              >
                {latestRelease.seen ? "Mark as Unseen" : "Mark as Seen"}
              </Button>
            </Box>

            <Box display="flex" alignItems="center" mb={2} gap={1}>
              <TagIcon fontSize="small" />
              <Chip
                label={latestRelease.tag_name}
                size="small"
                color="primary"
                variant="outlined"
              />

              {latestRelease.published_at && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  <DateRangeIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ ml: 0.5 }}
                  >
                    {format(
                      new Date(latestRelease.published_at),
                      "MMM d, yyyy"
                    )}
                  </Typography>
                </Box>
              )}
            </Box>

            {latestRelease.body && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {latestRelease.body}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No releases available for this repository.
        </Typography>
      )}
    </Box>
  );
};

export default RepositoryDetails;
