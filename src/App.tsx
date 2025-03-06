import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./contexts/LanguageContext";

function App() {
  return (
    <ChakraProvider>
      <LanguageProvider>
        <Router>
          <Box
            minH="100vh"
            w="100%"
            bg="gray.50"
            _dark={{
              bg: "gray.900",
            }}
          >
            <Navbar />
            <Dashboard />
          </Box>
        </Router>
      </LanguageProvider>
    </ChakraProvider>
  );
}

export default App;
