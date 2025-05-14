import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_LATEST_RELEASE } from "../graphql/queries";
import { TOGGLE_RELEASE_SEEN } from "../graphql/mutations";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Chip,
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
            query: GET_LATEST_RELEASE,
            variables: { id },
          });

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
      <Box mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          {repository.name}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>
        Releases
      </Typography>

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
