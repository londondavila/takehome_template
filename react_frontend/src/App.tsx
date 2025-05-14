import React from "react";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { client } from "./apollo-client";
import Header from "./components/Header";
import RepositoryList from "./components/RepositoryList";
import AddRepository from "./components/AddRepository";
import { Box, Container } from "@mui/material";

// Define theme for Material UI components
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2c387e",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1">
              <Container maxWidth="lg">
                {/* AddRepository Form */}
                <Box my={4}>
                  <AddRepository />
                </Box>

                {/* Integrated Repository List and Details */}
                <Box my={4}>
                  <RepositoryList />
                </Box>
              </Container>
            </main>
            <footer className="bg-gray-100 border-t border-gray-200 p-2 text-center text-xs text-gray-500">
              GitHub Repository Tracker | TypeScript + React + GraphQL +
              PostgreSQL
            </footer>
          </div>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
