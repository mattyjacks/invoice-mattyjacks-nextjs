"use client";

import React, { useCallback, useState } from "react";
import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, formatDate } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "../ui/checkbox";
import { createInvoice } from "@/app/actions/formAction";
import InvoicePreview from "../InvoicePreview";
import { CalendarIcon, FileJson, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function InvoiceForm() {
  const form = useForm({
    defaultValues: {
      hourlyRate: '',
      hoursWorked: '',
      invoiceAmount: '',
    },
  });

  const { watch, setValue } = form;
  const hourlyRate = watch('hourlyRate');
  const hoursWorked = watch('hoursWorked');

  // Auto calculate invoice amount based on hourly rate and hours worked
  useEffect(() => {
    const rate = parseFloat(hourlyRate) || 0;
    const hours = parseFloat(hoursWorked) || 0;
    const invoiceAmount = (rate * hours).toFixed(2); // Multiply and round to 2 decimals
    setValue('invoiceAmount', invoiceAmount); // Set the calculated value in the invoiceAmount field
  }, [hourlyRate, hoursWorked, setValue]);}

export type FormSchemaType = z.infer<typeof formSchema>;

const formSchema = z.object({
  fullLegalName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  discordDisplayName: z.string().optional(),
  discordUsername: z.string().optional(),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }), // Ensure phone number is at least 10 digits
  redditUsername: z.string().optional(),
  country: z.string(),
  customName: z.string().optional(),
  customEmail: z.string().email().optional(),
  paypalEmail: z.string().optional(),
  paypalDob: z.date().optional(),
  invoiceType: z.enum(["one-time", "hourly"]),
  invoiceAmount: z.string().optional(),
  hourlyRate: z.string().optional(),
  hoursWorked: z.string().optional(),
  ltcWalletAddress: z.string().optional(),
  taskDescription: z.string().min(1, {
    message: "Task description is required.",
  }),
  invoiceStatus: z.string(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
  invoiceId: z.string(),
  otherPaymentDetails: z.string().optional(),
  isPayPalAccountHolder: z.boolean().default(false),
});


function generateInvoiceID(person?: string): string {
  const possibleCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  const SPECIAL_PREFIX_MATTYJACKS = "MJ-";
  const SPECIAL_PREFIX_FIREBRINGERAI = "FBAI-";
  const DEFAULT_PREFIX = "HC-";

  let result;
  switch (person) {
    case "MattyJacks":
      result = SPECIAL_PREFIX_MATTYJACKS;
      break;
    case "FirebringerAI":
      result = SPECIAL_PREFIX_FIREBRINGERAI;
      break;
    default:
      result = DEFAULT_PREFIX;
  }

  const randomCharacters = Array.from({ length: 7 }, () =>
    possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
  );

  result += randomCharacters.join("");

  return result;
}

function getEmailAddress(person?: string): string {
  switch (person) {
    case "MattyJacks":
      return "Matty@firebringerai.com";
    case "FirebringerAI":
      return "Justin@firebringerai.com";
    default:
      return "";
  }
}

export function FormN() {
  const [showFields, setFields] = useState(false);
  const [Loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullLegalName: "",
      email: "",
      discordDisplayName: "",
      discordUsername: "",
      phoneNumber: "",
      redditUsername: "",
      country: "",
      customName: "",
    customEmail: "",
      paypalEmail: "",
      invoiceType: "one-time",
      invoiceAmount: "",
      paypalDob: "",
      hourlyRate: "",
      isPayPalAccountHolder: false,
      hoursWorked: "",
      ltcWalletAddress: "",
      taskDescription: "",
      invoiceStatus: "",
      paymentMethod: "",
      otherPaymentDetails: "",
      notes: "",
      invoiceId: generateInvoiceID("MattyJacks"),
    },
  });

  const generateJsonData = () => {
    const formData = form.getValues();
    const jsonData = JSON.stringify(formData, null, 2);
    return jsonData;
  };

  const handleDownloadJson = () => {
    const jsonData = generateJsonData();
    const dataObj = JSON.parse(jsonData);
  
    // Check if 'name' and 'email' are present
    if (!dataObj.fullLegalName || !dataObj.email) {
      alert("You need to fill required details before downloading the File. ");
      return;
    }
  
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target?.result as string);

            Object.keys(json).forEach((key) => {
              if (key in form.getValues()) {
                form.setValue(key as keyof FormSchemaType, json[key]);
              }
            });

            setFields(json.invoiceType === "hourly");
          } catch (error) {
            console.error("Error parsing JSON file:", error);
          }
        };
        reader.readAsText(file);
      }
    },
    [form]
  );

  async function onSubmit(values: any) {
    setLoading(true);
    try {
      const response = await createInvoice(values);
      console.log("Server response:", response);
      if (response.success) {
        alert(
          `Invoice created successfully. Invoice ID: ${response.Invoice?.id}`
        );
      } else {
        alert(`Failed to create invoice. Error: ${response.error}`);
      }

    } catch (error) {
      console.error("Error in onSubmit:", error);
      alert(`An error occurred: ${error}`);
    } finally {
      setLoading(false);
      form.reset();
    }
  }
  const [selectedRecipient, setSelectedRecipient] = useState("MattyJacks"); // Default value


  return (
    <div className=" flex flex-col justify-center items-center gap-6">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Invoice Form</CardTitle>
          <CardDescription>This is the new invoice generator.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Info</h3>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="fullLegalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Legal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Matt Jackson" {...field} />
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
                          <Input placeholder="mattyjacks11@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="discordDisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Matt Jackson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discordUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Username</FormLabel>
                        <FormControl>
                          <Input placeholder="@mattyjacks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Phone Number with Country Code</FormLabel>
                        <FormControl>
                          <Input placeholder="+15106005735" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="redditUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reddit Username</FormLabel>
                        <FormControl>
                          <Input placeholder="u/growthget" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="mt-4 md:mt-0">
  <FormLabel>Send Invoice To</FormLabel>
  <Select
     onValueChange={(newValue) => {
      if (newValue === "custom") {
        form.setValue("invoiceId", "INV-" + Math.random().toString(36).substr(2, 7).toUpperCase());
      } else {
        form.setValue("invoiceId", generateInvoiceID(newValue));
      }
      setSelectedRecipient(newValue);
    }}
    defaultValue={"MattyJacks"}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select the person" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="MattyJacks">MattyJacks</SelectItem>
      <SelectItem value="Hypnosis Capital">Hypnosis Capital</SelectItem>
      <SelectItem value="FirebringerAI">FirebringerAI</SelectItem>
      <SelectItem value="custom">Custom</SelectItem>
    </SelectContent>
  </Select>
</FormItem>


{selectedRecipient === "custom" && (
  <>
    <FormField
      control={form.control}
      name="customName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Custom Company Name to Invoice</FormLabel>
          <FormControl>
            <Input placeholder="Enter Custom Company Name to Invoice" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="customEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Custom Email to Invoice</FormLabel>
          <FormControl>
            <Input placeholder="Enter Custom Email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
)}

{/* Instructions Section 
<div className="mt-4">
  {selectedRecipient === "MattyJacks" && (
    <p style={{ fontSize: '0.8em', color: 'grey' }} className="whitespace-nowrap">
      If you're facing any issues, please feel free to contact mattyjacks11@gmail.com.
    </p>
  )}
  {selectedRecipient === "Hypnosis Capital" && (
    <p style={{ fontSize: '0.8em', color: 'grey' }} className="whitespace-nowrap">
      If you're facing any issues, please feel free to contact hypnosiscapital.com.
    </p>
  )}
  {selectedRecipient === "FirebringerAI" && (
    <p style={{ fontSize: '0.8em', color: 'grey' }} className="whitespace-nowrap">
      If you're facing any issues, please feel free to contact Matt@firebringerai.com or Justin@firebringerai.com
    </p>
  )}
  {selectedRecipient === "custom" && (
    <p style={{ fontSize: '0.8em', color: 'grey' }} className="whitespace-nowrap">
      If you're facing any issues, please contact {form.watch("customName")} at {form.watch("customEmail")}.
    </p>
  )}
</div>
*/}




{/* Invoice Preview Section */}
<div>
  {/* Invoice Preview component/code here */}
</div>

                </div>
              </div>

              {/* Payment Information section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mt-6">
                  Payment Info
                </h3>
                <FormField
                  control={form.control}
                  name="invoiceType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Invoice Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFields(value === "hourly");
                          }}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="one-time" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              One Time
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="hourly" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Hourly
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showFields && (
  <div className="grid grid-cols-2 gap-4">
    
<FormField
  control={form.control}
  name="hourlyRate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Hourly Rate</FormLabel>
      <div className="flex items-center border rounded-md">
        <span className="px-2">$</span> {/* Dollar sign */}
        <FormControl className="flex-grow">
          <Input
            placeholder="10.00"
            {...field}
            className="border-none focus:ring-0" // Remove border and focus ring from input
          />
        </FormControl>
        <span className="px-2">USD</span> {/* Currency label */}
      </div>
      <FormMessage />
    </FormItem>
  )}
/>
    <FormField
      control={form.control}
      name="hoursWorked"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Hours Worked</FormLabel>
          <FormControl>
            <Input placeholder="5" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>

        
      )}
      
    />

    
  </div>



)}

{showFields && (
  <div className="flex justify-end mb-4">
    <Button
      className="bg-blue-500"
      onClick={() => {
        const hourlyRate = parseFloat(form.watch("hourlyRate")) || 0;
        const hoursWorked = parseFloat(form.watch("hoursWorked")) || 0;
        const invoiceAmount = (hourlyRate * hoursWorked).toFixed(2);
        form.setValue("invoiceAmount", invoiceAmount);
      }}
    >
      Calculate
    </Button>
  </div>
)}

<FormField
  control={form.control}
  name="invoiceAmount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Invoice Amount</FormLabel>
      <div className="flex items-center border rounded-md">
        <span className="px-2">$</span> {/* Dollar sign */}
        <FormControl className="flex-grow">
          <Input
            placeholder="10.00"
            {...field}
            className="border-none focus:ring-0" // Remove border and focus ring from input
          />
        </FormControl>
        <span className="px-2">USD</span> {/* Currency label */}
      </div>
      <FormMessage />
    </FormItem>
  )}
/>


<FormField
    control={form.control}
    name="invoiceStatus"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Invoice Status</FormLabel>
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select invoice status" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
                
              </div>

              {/* Payment Info section */}
              <div className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ltc-crypto">LTC Crypto</SelectItem>
                          <SelectItem value="paypal">
                            Paypal Goods and Services
                          </SelectItem>
                          <SelectItem value="Other">
                            Other as Discussed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("paymentMethod") === "paypal" && (
                  <>
                    <FormField
                      control={form.control}
                      name="paypalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="PayPalEmail@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPayPalAccountHolder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                          <FormDescription className="flex flex-col items-start">
  Are you the owner of this PayPal account? If it's someone else's account, DO NOT CHECK THIS BOX!{" "}
  <br />
  <span style={{ fontSize: '0.8em', color: 'grey' }}>
    Note that it's glitchy right now. Ignore the date of birth.
  </span>
  <TooltipProvider>
    <Tooltip>
      <TooltipContent>
        <p>
          Placeholder Tooltip for PayPal account non-holder
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</FormDescription>


                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("isPayPalAccountHolder") === true && (
                      <FormField
                        control={form.control}
                        name="paypalDob"
                        render={({ field }) => (
                          <FormItem className="flex flex-col ">
                            <FormLabel>Your Date of Birth</FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[240px] pl-3 text-left font-normal bg-transparent",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {form.watch("paymentMethod") === "ltc-crypto" && (
                  <FormField
                    control={form.control}
                    name="ltcWalletAddress"
                    render={({ field }) => (
                      <FormItem>
  <FormLabel>LTC Wallet Address</FormLabel>
  <FormControl>
    <Input placeholder="Wallet Address" {...field} />
  </FormControl>
  <FormDescription>
    <Button
      className="w-fit bg-blue-500 text-white hover:text-black flex items-center"
      onClick={() =>
        window.open(
          `https://blockchair.com/litecoin/address/${field.value}`
        )
      }
    >
      Check Wallet Activity 
      <svg
        width="19px"
        height="19px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ml-2"
        style={{ marginTop: '2px', marginLeft: '4px' }} // Adjust margins here
      >
        
        <path d="M10 16V14.0003M10 14.0003V12M10 14.0003L12 14.0005M10 14.0003L8 14M21 12V11.2C21 10.0799 21 9.51984 20.782 9.09202C20.5903 8.71569 20.2843 8.40973 19.908 8.21799C19.4802 8 18.9201 8 17.8 8H3M21 12V16M21 12H19C17.8954 12 17 12.8954 17 14C17 15.1046 17.8954 16 19 16H21M21 16V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8V8M18 8V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
    </Button>
    <span style={{ fontSize: '0.9em', color: 'grey' }}>
    If you've never used this wallet before, the blockchain history will be blank. If you have used this wallet before, there will be Blockchair history. This is to help ensure that the LTC address is correct. If you type in the wrong address and we send the LTC to the address you've entered, then the payment is still considered complete, so please be careful. You can request a test transaction if it's a new wallet to ensure safety.
  </span>
  </FormDescription>
  <FormMessage />
</FormItem>
                    )}
                  />
                )}

                {form.watch("paymentMethod") === "others" && (
                  <FormField
                    control={form.control}
                    name="otherPaymentDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Payment Details</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Please provide your preferred payment method"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>


              

              {/* Additional Information section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mt-6">
                  Additional Info
                </h3>


                <FormField
                  control={form.control}
                  name="taskDescription"
                  render={({ field }) => (
                    <FormItem>
  <FormLabel>Task Description</FormLabel>
  <FormControl>
    <React.Fragment>
      <Textarea
        placeholder="Describe the task, and the results. This part is required in order to be paid."
        className="resize-none placeholder-grey" // Add class for placeholder styling
        {...field}
      />
      <style jsx>{`
        .placeholder-grey::placeholder {
          color: grey; /* Set placeholder text color */
        }
      `}</style>
    </React.Fragment>
  </FormControl>
  <FormMessage />
</FormItem>

                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <React.Fragment>
                        <Textarea
                          placeholder="Add any additional notes..."
                          className="resize-none placeholder-grey" // Add class for placeholder styling
                          {...field}
                        />
                        <style jsx>{`
                          .placeholder-grey::placeholder {
                            color: grey; /* Set placeholder text color */
                          }
                        `}</style>
                      </React.Fragment>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                  )}
                />
                

<FormItem>
  <FormDescription style={{ fontSize: '0.8em', color: 'grey', margin: '0' }}>
    Save time next time you fill out this form! Download the JSON formatted file after you're done filling it out, and upload it to pre-fill the data.
  </FormDescription>
  <FormMessage />
</FormItem>

              </div>  
            </CardContent>
            <CardFooter className="flex justify-center">
  <input
    type="file"
    accept=".json"
    style={{ display: "none" }} // This hides the input element
    id="jsonFileInput" // ID to reference the input
    onChange={(e) => handleFileUpload(e)} // Handle file upload
  />

<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center w-full">
  {/* Download JSON Button */}
  <Button
    className="bg-green-500 w-full md:w-1/2 xl:w-1/3"
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '40px' }} // Set equal height
    onClick={handleDownloadJson}
  >
    Download JSON <FileJson className="size-5 ml-2" />
  </Button>

  {/* Upload JSON Button */}
  <Button
    className="bg-blue-500 w-full md:w-1/2 xl:w-1/3"
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '40px' }} // Set equal height
    onClick={(e) => {
      e.preventDefault(); // Prevent form validation
      setTimeout(() => {
        const inputElement = document.getElementById("jsonFileInput");
        if (inputElement) {
          inputElement.click(); // Open the file dialog
        }
      }, 0); // Delay to ensure the DOM is ready
    }}
  >
    Upload JSON <FileJson className="size-5 ml-2" />
  </Button>
</div>

</CardFooter>



          </form>
        </Form>
      </Card>
      <div className="col-span-1 w-full h-full">
        <InvoicePreview control={form.control} />
      </div>
    </div>
  );
}
