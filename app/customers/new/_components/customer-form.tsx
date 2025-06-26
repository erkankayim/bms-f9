"use client"

import React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addCustomerAction, updateCustomerAction } from "../_actions/customers-actions"
import { useRouter } from "next/navigation"

// Define the Zod schema for form validation
const customerFormSchema = z.object({
  mid: z.string().min(1, "Customer ID is required"),
  service_name: z.string().optional(),
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  tax_office: z.string().optional(),
  tax_number: z.string().optional(),
  customer_group: z.string().optional(),
  balance: z.coerce.number().optional().default(0),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  initialData?: Partial<CustomerFormValues>
  isEditMode?: boolean
  customerId?: string
}

export function CustomerForm({ initialData, isEditMode = false, customerId }: CustomerFormProps) {
  // console.log("Rendering CustomerForm (Client Component)", { isEditMode, customerId, initialData }); // For debugging
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialData || {
      mid: "",
      service_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      tax_office: "",
      tax_number: "",
      customer_group: "",
      balance: 0,
      notes: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  async function onSubmit(data: CustomerFormValues) {
    let result
    if (isEditMode && customerId) {
      result = await updateCustomerAction(customerId, data)
    } else {
      result = await addCustomerAction(data)
    }

    if (result.success) {
      toast({
        title: isEditMode ? "Customer Updated" : "Customer Added",
        description: `Customer ${data.contact_name} has been successfully ${isEditMode ? "updated" : "added"}.`,
      })
      if (!isEditMode) {
        form.reset()
      }
      router.push("/customers")
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || `Could not ${isEditMode ? "update" : "add"} customer. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ... (rest of the form fields are the same as before) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="mid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer ID *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., CUST-0001" {...field} readOnly={isEditMode} />
                </FormControl>
                {isEditMode && <FormDescription>Customer ID cannot be changed.</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service/Subscription Name</FormLabel>
                <FormControl>
                  <Input placeholder="Premium Support" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Group</FormLabel>
                <FormControl>
                  <Input placeholder="Retail / Wholesale" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Balance</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Current outstanding balance.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, Anytown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City/Town</FormLabel>
                <FormControl>
                  <Input placeholder="Anytown" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province/State</FormLabel>
                <FormControl>
                  <Input placeholder="CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="90210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tax_office"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Office</FormLabel>
                <FormControl>
                  <Input placeholder="City Tax Office" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tax_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about the customer..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isEditMode
              ? "Updating Customer..."
              : "Adding Customer..."
            : isEditMode
              ? "Save Changes"
              : "Add Customer"}
        </Button>
      </form>
    </Form>
  )
}
