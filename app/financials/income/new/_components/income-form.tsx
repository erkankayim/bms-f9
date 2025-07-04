"use client"

import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Box,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
} from "@chakra-ui/react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import type { Income } from "@/types/income"

const schema = yup.object({
  source: yup.string().required("Source is required"),
  amount: yup.number().required("Amount is required").positive("Amount must be positive"),
  type: yup.string().required("Type is required"),
})

type FormData = yup.InferType<typeof schema>

interface IncomeFormProps {
  onSubmit: (data: Income) => void
  isLoading: boolean
}

export function IncomeForm({ onSubmit, isLoading }: IncomeFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  return (
    <Box bg="white" borderRadius="lg" boxShadow="md" p={4} maxWidth="md" mx="auto">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Add New Income
      </Text>
      <form onSubmit={handleSubmit((data) => onSubmit(data as Income))}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.source}>
            <FormLabel htmlFor="source">Source</FormLabel>
            <Controller
              name="source"
              control={control}
              defaultValue=""
              render={({ field }) => <Input id="source" placeholder="Source" {...field} />}
            />
            <FormErrorMessage>{errors.source?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.amount}>
            <FormLabel htmlFor="amount">Amount</FormLabel>
            <Controller
              name="amount"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <NumberInput>
                  <NumberInputField id="amount" {...field} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
            />
            <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.type}>
            <FormLabel htmlFor="type">Type</FormLabel>
            <Controller
              name="type"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select id="type" {...field}>
                  <option value="salary">Salary</option>
                  <option value="investment">Investment</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </Select>
              )}
            />
            <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
          </FormControl>

          <Button colorScheme="blue" type="submit" isLoading={isLoading} width="full">
            Add Income
          </Button>
        </Stack>
      </form>
    </Box>
  )
}

// 👇 add this at the very end of the file
export default IncomeForm
