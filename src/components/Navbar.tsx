import { Box, Flex, Heading, useColorModeValue, Button, HStack, Container } from '@chakra-ui/react'
import { FaBug } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'

const Navbar = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const { t, language, setLanguage } = useLanguage()

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Container maxW="container.xl" px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg="blue.50"
              color="blue.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaBug size={20} />
            </Box>
            <Heading size="md" fontWeight="bold">
              {t('title')}
            </Heading>
          </Flex>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={language === 'en' ? 'solid' : 'ghost'}
              onClick={() => setLanguage('en')}
              colorScheme="blue"
              borderRadius="md"
              px={4}
            >
              EN
            </Button>
            <Button
              size="sm"
              variant={language === 'pt' ? 'solid' : 'ghost'}
              onClick={() => setLanguage('pt')}
              colorScheme="blue"
              borderRadius="md"
              px={4}
            >
              PT
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar 