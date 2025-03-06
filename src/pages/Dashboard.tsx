import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  VStack,
  Heading,
  Text,
  Code,
  useToast,
  Button,
  Card,
  CardBody,
  Badge,
  HStack,
  IconButton,
  Tooltip,
  Input,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Divider,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { FaCopy, FaTrash, FaCode, FaList, FaGlobe, FaNetworkWired, FaCheckCircle, FaExclamationCircle, FaLink } from "react-icons/fa";
import { io } from "socket.io-client";
import { useLanguage } from "../contexts/LanguageContext";

interface RequestLog {
  id: string;
  type: 'request' | 'response' | 'error';
  timestamp: string;
  url: string;
  fullUrl: string;
  method: string;
  body?: unknown;
  data?: unknown;
  params?: unknown;
  headers: Record<string, string>;
  status?: number;
  message?: string;
  requestBody?: unknown;
  requestParams?: unknown;
  response?: {
    status: number;
    data: unknown;
  };
}

const Dashboard = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [ngrokUrl, setNgrokUrl] = useState("");
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const codeBg = useColorModeValue("gray.50", "gray.700");

  // Função auxiliar para verificar se um objeto tem propriedades
  const hasProperties = (obj: unknown): boolean => {
    return obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0;
  };

  // Função para extrair os dados corretos do log
  const extractLogData = (log: RequestLog): RequestLog => {
    // Se o log tem um body com type, é uma requisição encapsulada
    if (log.body && typeof log.body === 'object' && 'type' in log.body) {
      const bodyData = log.body as Record<string, unknown>;
      const newLog: RequestLog = {
        ...log,
        type: (bodyData.type as RequestLog['type']) || log.type,
        url: (bodyData.url as string) || log.url,
        fullUrl: (bodyData.fullUrl as string) || log.fullUrl,
        method: (bodyData.method as string)?.toUpperCase() || log.method,
        headers: (bodyData.headers as Record<string, string>) || log.headers,
        timestamp: (bodyData.timestamp as string) || log.timestamp
      };
      
      if (bodyData.data !== undefined) newLog.data = bodyData.data;
      if (bodyData.params !== undefined) newLog.params = bodyData.params;
      if (bodyData.status !== undefined) newLog.status = bodyData.status as number;
      if (bodyData.message !== undefined) newLog.message = bodyData.message as string;
      if (bodyData.requestBody !== undefined) newLog.requestBody = bodyData.requestBody;
      if (bodyData.requestParams !== undefined) newLog.requestParams = bodyData.requestParams;
      if (bodyData.response !== undefined) newLog.response = bodyData.response as RequestLog['response'];
      
      return newLog;
    }
    return log;
  };

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("existingRequests", (existingLogs: RequestLog[]) => {
      setLogs(existingLogs.map(extractLogData));
    });

    socket.on("newRequest", (data: RequestLog) => {
      console.log("Received data:", data);
      setLogs((prev) => [extractLogData(data), ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const exampleCode = `import axios from 'axios';
import Constants from 'expo-constants';
import {env} from '../env';

const api = axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(config => {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  config.headers['X-APP-VERSION'] = appVersion;
  return config;
});

if (__DEV__) {
  const WEBHOOK_URL = '${ngrokUrl || "YOUR_NGROK_URL"}';

  api.interceptors.request.use(
    async request => {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'request',
            timestamp: new Date().toISOString(),
            url: request.url,
            fullUrl: request.baseURL + request.url,
            method: request.method,
            data: request.data,
            params: request.params,
            headers: request.headers,
          })
        }).catch(() => {});
      } catch {} // ignora erros do webhook
      
      return request;
    }
  );

  api.interceptors.response.use(
    async response => {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'response',
            timestamp: new Date().toISOString(),
            status: response.status,
            data: response.data,
            headers: response.headers,
            url: response.config.url,
            fullUrl: response.config.baseURL + response.config.url,
            requestData: response.config.data,
            requestParams: response.config.params,
          })
        }).catch(() => {});
      } catch {} // ignora erros do webhook
      
      return response;
    },
    async error => {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error',
            timestamp: new Date().toISOString(),
            message: error.message,
            url: error.config?.url,
            fullUrl: error.config?.baseURL + error.config?.url,
            requestData: error.config?.data,
            requestParams: error.config?.params,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data,
            } : null
          })
        }).catch(() => {});
      } catch {} // ignora erros do webhook
      
      return Promise.reject(error);
    }
  );
}

export default api;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exampleCode);
    toast({
      title: t("codeCopied"),
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: t("requestsCleared"),
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const formatHeaders = (headers: Record<string, string>) => {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const getLogIcon = (type: RequestLog['type']) => {
    switch (type) {
      case 'request':
        return <FaNetworkWired />;
      case 'response':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      default:
        return <FaCode />;
    }
  };

  const getLogColor = (type: RequestLog['type']) => {
    switch (type) {
      case 'request':
        return 'blue';
      case 'response':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box w="full" bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 6, lg: 8 }}
          w="full"
        >
          <VStack align="stretch" spacing={6} w="full">
            <Box>
              <Heading size="lg" mb={4} fontWeight="bold">
                {t("title")}
              </Heading>
              <Text color="gray.600" fontSize="md">
                {t("subtitle")}
              </Text>
            </Box>

            <Card
              shadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
              bg={cardBg}
            >
              <CardBody>
                <FormControl mb={6}>
                  <FormLabel fontWeight="medium">{t("ngrokUrl")}</FormLabel>
                  <Input
                    placeholder={t("ngrokPlaceholder")}
                    value={ngrokUrl}
                    onChange={(e) => setNgrokUrl(e.target.value)}
                    size="md"
                    borderRadius="md"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500" }}
                    bg="white"
                  />
                </FormControl>

                <Divider my={6} />

                <HStack justify="space-between" mb={4}>
                  <Heading size="md" fontWeight="semibold">
                    {t("exampleCode")}
                  </Heading>
                  <Tooltip label={t("copyCode")}>
                    <IconButton
                      aria-label={t("copyCode")}
                      icon={<FaCopy />}
                      onClick={copyToClipboard}
                      colorScheme="blue"
                      variant="ghost"
                      size="sm"
                      borderRadius="md"
                    />
                  </Tooltip>
                </HStack>
                <Code
                  display="block"
                  whiteSpace="pre"
                  p={4}
                  borderRadius="md"
                  bg={codeBg}
                  fontSize="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  {exampleCode}
                </Code>
              </CardBody>
            </Card>
          </VStack>

          <VStack align="stretch" spacing={6} w="full">
            <HStack justify="space-between">
              <Heading size="lg" fontWeight="bold">
                {t("incomingRequests")}
              </Heading>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                variant="ghost"
                onClick={clearLogs}
                size="sm"
                borderRadius="md"
              >
                {t("clearAll")}
              </Button>
            </HStack>

            <Card
              shadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
              bg={cardBg}
            >
              <CardBody p={0}>
                <Tabs>
                  <TabList px={4} pt={2}>
                    <Tab
                      _selected={{ color: "blue.500", borderColor: "blue.500" }}
                      fontWeight="medium"
                    >
                      <HStack spacing={2}>
                        <FaList />
                        <Text>{t("incomingRequests")}</Text>
                      </HStack>
                    </Tab>
                    <Tab
                      _selected={{ color: "blue.500", borderColor: "blue.500" }}
                      fontWeight="medium"
                    >
                      <HStack spacing={2}>
                        <FaCode />
                        <Text>Raw Data</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel p={4}>
                      <Box 
                        maxH="calc(100vh - 400px)" 
                        overflowY="auto"
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            width: '6px',
                            background: 'transparent',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#CBD5E0',
                            borderRadius: '24px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: '#A0AEC0',
                          },
                        }}
                      >
                        <VStack spacing={4} align="stretch">
                          {logs.length === 0 ? (
                            <Box
                              p={8}
                              textAlign="center"
                              bg={codeBg}
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor={borderColor}
                            >
                              <FaGlobe
                                size={32}
                                color="#CBD5E0"
                                style={{ margin: "0 auto 1rem" }}
                              />
                              <Text color="gray.500">{t("noRequests")}</Text>
                            </Box>
                          ) : (
                            logs.map((log) => (
                              <Card
                                key={log.id}
                                shadow="sm"
                                borderWidth="1px"
                                borderColor={borderColor}
                                _hover={{ shadow: "md" }}
                                transition="all 0.2s"
                                bg={cardBg}
                              >
                                <CardBody>
                                  <HStack spacing={2} mb={3}>
                                    <Badge
                                      colorScheme={getLogColor(log.type)}
                                      px={2}
                                      py={1}
                                      borderRadius="md"
                                    >
                                      <HStack spacing={1}>
                                        {getLogIcon(log.type)}
                                        <Text>{String(log.type).toUpperCase()}</Text>
                                      </HStack>
                                    </Badge>
                                    <Text fontSize="sm" color="gray.500">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                  </HStack>

                                  <VStack align="stretch" spacing={2} mb={3}>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                                        {log.method}
                                      </Badge>
                                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                        {log.url}
                                      </Text>
                                    </HStack>
                                    <HStack spacing={2} color="gray.500" fontSize="sm">
                                      <FaLink />
                                      <Text isTruncated>{log.fullUrl}</Text>
                                    </HStack>
                                  </VStack>
                                  
                                  <Accordion allowMultiple>
                                    {log.headers && (
                                      <AccordionItem border="none">
                                        <AccordionButton
                                          px={0}
                                          _hover={{ bg: "transparent" }}
                                          _expanded={{ bg: "transparent" }}
                                        >
                                          <HStack spacing={2}>
                                            <FaNetworkWired />
                                            <Text fontWeight="medium">Headers</Text>
                                          </HStack>
                                          <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel px={0}>
                                          <Box 
                                            maxH="300px" 
                                            overflowY="auto"
                                            overflowX="auto"
                                            maxW="100%"
                                            css={{
                                              '&::-webkit-scrollbar': {
                                                width: '4px',
                                                height: '4px',
                                              },
                                              '&::-webkit-scrollbar-track': {
                                                width: '6px',
                                                background: 'transparent',
                                              },
                                              '&::-webkit-scrollbar-thumb': {
                                                background: '#CBD5E0',
                                                borderRadius: '24px',
                                              },
                                              '&::-webkit-scrollbar-thumb:hover': {
                                                background: '#A0AEC0',
                                              },
                                            }}
                                          >
                                            <Code
                                              display="block"
                                              whiteSpace="pre"
                                              p={3}
                                              borderRadius="md"
                                              bg={codeBg}
                                              fontSize="xs"
                                              borderWidth="1px"
                                              borderColor={borderColor}
                                              w="100%"
                                              maxW="100%"
                                              overflowX="auto"
                                            >
                                              {formatHeaders(log.headers)}
                                            </Code>
                                          </Box>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    )}

                                    {hasProperties(log.params) && (
                                      <AccordionItem border="none">
                                        <AccordionButton
                                          px={0}
                                          _hover={{ bg: "transparent" }}
                                          _expanded={{ bg: "transparent" }}
                                        >
                                          <HStack spacing={2}>
                                            <FaCode />
                                            <Text fontWeight="medium">Query Params</Text>
                                          </HStack>
                                          <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel px={0}>
                                          <Box 
                                            maxH="300px" 
                                            overflowY="auto"
                                            overflowX="auto"
                                            maxW="100%"
                                            css={{
                                              '&::-webkit-scrollbar': {
                                                width: '4px',
                                                height: '4px',
                                              },
                                              '&::-webkit-scrollbar-track': {
                                                width: '6px',
                                                background: 'transparent',
                                              },
                                              '&::-webkit-scrollbar-thumb': {
                                                background: '#CBD5E0',
                                                borderRadius: '24px',
                                              },
                                              '&::-webkit-scrollbar-thumb:hover': {
                                                background: '#A0AEC0',
                                              },
                                            }}
                                          >
                                            <Code
                                              display="block"
                                              whiteSpace="pre"
                                              p={3}
                                              borderRadius="md"
                                              bg={codeBg}
                                              fontSize="xs"
                                              borderWidth="1px"
                                              borderColor={borderColor}
                                              w="100%"
                                              maxW="100%"
                                              overflowX="auto"
                                            >
                                              {typeof log.params === 'object' && log.params !== null ? 
                                                JSON.stringify(log.params, null, 2) : '{}'}
                                            </Code>
                                          </Box>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    )}

                                    {(hasProperties(log.body) || hasProperties(log.data)) && (
                                      <AccordionItem border="none">
                                        <AccordionButton
                                          px={0}
                                          _hover={{ bg: "transparent" }}
                                          _expanded={{ bg: "transparent" }}
                                        >
                                          <HStack spacing={2} flex="1" minW={0}>
                                            <FaCode />
                                            <Text fontWeight="medium" isTruncated>Request Body</Text>
                                          </HStack>
                                          <AccordionIcon flexShrink={0} />
                                        </AccordionButton>
                                        <AccordionPanel px={0} maxW="100%" overflow="hidden">
                                          <Box 
                                            maxH="300px" 
                                            overflowY="auto"
                                            overflowX="auto"
                                            maxW="100%"
                                            w="100%"
                                            css={{
                                              '&::-webkit-scrollbar': {
                                                width: '4px',
                                                height: '4px',
                                              },
                                              '&::-webkit-scrollbar-track': {
                                                width: '6px',
                                                background: 'transparent',
                                              },
                                              '&::-webkit-scrollbar-thumb': {
                                                background: '#CBD5E0',
                                                borderRadius: '24px',
                                              },
                                              '&::-webkit-scrollbar-thumb:hover': {
                                                background: '#A0AEC0',
                                              },
                                            }}
                                          >
                                            <Code
                                              display="block"
                                              whiteSpace="pre-wrap"
                                              p={3}
                                              borderRadius="md"
                                              bg={codeBg}
                                              fontSize="xs"
                                              borderWidth="1px"
                                              borderColor={borderColor}
                                              w="100%"
                                              maxW="100%"
                                              wordBreak="break-word"
                                            >
                                              {typeof (log.body || log.data) === 'object' ? 
                                                JSON.stringify(log.body || log.data, null, 2) : '{}'}
                                            </Code>
                                          </Box>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    )}

                                    {log.type === 'response' && log.status && (
                                      <AccordionItem border="none">
                                        <AccordionButton
                                          px={0}
                                          _hover={{ bg: "transparent" }}
                                          _expanded={{ bg: "transparent" }}
                                        >
                                          <HStack spacing={2} flex="1" minW={0}>
                                            <FaCheckCircle />
                                            <Text fontWeight="medium" isTruncated>Response</Text>
                                          </HStack>
                                          <AccordionIcon flexShrink={0} />
                                        </AccordionButton>
                                        <AccordionPanel px={0} maxW="100%" overflow="hidden">
                                          <VStack align="stretch" spacing={2}>
                                            <Badge
                                              colorScheme={log.status >= 400 ? 'red' : 'green'}
                                              alignSelf="start"
                                            >
                                              Status: {log.status}
                                            </Badge>
                                            <Box 
                                              maxH="300px" 
                                              overflowY="auto"
                                              overflowX="auto"
                                              maxW="100%"
                                              w="100%"
                                              css={{
                                                '&::-webkit-scrollbar': {
                                                  width: '4px',
                                                  height: '4px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                  width: '6px',
                                                  background: 'transparent',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                  background: '#CBD5E0',
                                                  borderRadius: '24px',
                                                },
                                                '&::-webkit-scrollbar-thumb:hover': {
                                                  background: '#A0AEC0',
                                                },
                                              }}
                                            >
                                              <Code
                                                display="block"
                                                whiteSpace="pre-wrap"
                                                p={3}
                                                borderRadius="md"
                                                bg={codeBg}
                                                fontSize="xs"
                                                borderWidth="1px"
                                                borderColor={borderColor}
                                                w="100%"
                                                maxW="100%"
                                                wordBreak="break-word"
                                              >
                                                {JSON.stringify(log.data || log.response?.data, null, 2)}
                                              </Code>
                                            </Box>
                                          </VStack>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    )}

                                    {log.type === 'error' && log.message && (
                                      <AccordionItem border="none">
                                        <AccordionButton
                                          px={0}
                                          _hover={{ bg: "transparent" }}
                                          _expanded={{ bg: "transparent" }}
                                        >
                                          <HStack spacing={2} flex="1" minW={0}>
                                            <FaExclamationCircle />
                                            <Text fontWeight="medium" isTruncated>Error</Text>
                                          </HStack>
                                          <AccordionIcon flexShrink={0} />
                                        </AccordionButton>
                                        <AccordionPanel px={0} maxW="100%" overflow="hidden">
                                          <VStack align="stretch" spacing={2}>
                                            <Text color="red.500" fontWeight="medium">
                                              {log.message}
                                            </Text>
                                            {log.response && (
                                              <Box 
                                                maxH="300px" 
                                                overflowY="auto"
                                                overflowX="auto"
                                                maxW="100%"
                                                w="100%"
                                                css={{
                                                  '&::-webkit-scrollbar': {
                                                    width: '4px',
                                                    height: '4px',
                                                  },
                                                  '&::-webkit-scrollbar-track': {
                                                    width: '6px',
                                                    background: 'transparent',
                                                  },
                                                  '&::-webkit-scrollbar-thumb': {
                                                    background: '#CBD5E0',
                                                    borderRadius: '24px',
                                                  },
                                                  '&::-webkit-scrollbar-thumb:hover': {
                                                    background: '#A0AEC0',
                                                  },
                                                }}
                                              >
                                                <Code
                                                  display="block"
                                                  whiteSpace="pre-wrap"
                                                  p={3}
                                                  borderRadius="md"
                                                  bg={codeBg}
                                                  fontSize="xs"
                                                  borderWidth="1px"
                                                  borderColor={borderColor}
                                                  w="100%"
                                                  maxW="100%"
                                                  wordBreak="break-word"
                                                >
                                                  {JSON.stringify(log.response, null, 2)}
                                                </Code>
                                              </Box>
                                            )}
                                          </VStack>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    )}
                                  </Accordion>
                                </CardBody>
                              </Card>
                            ))
                          )}
                        </VStack>
                      </Box>
                    </TabPanel>
                    <TabPanel p={4}>
                      <Box
                        p={4}
                        borderRadius="md"
                        bg={codeBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        maxH="calc(100vh - 400px)"
                        overflowY="auto"
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            width: '6px',
                            background: 'transparent',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#CBD5E0',
                            borderRadius: '24px',
                          },
                          '&::-webkit-scrollbar-thumb:hover': {
                            background: '#A0AEC0',
                          },
                        }}
                      >
                        <Code display="block" whiteSpace="pre" fontSize="sm">
                          {JSON.stringify(logs, null, 2)}
                        </Code>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
