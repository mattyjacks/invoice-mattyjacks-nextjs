"use client";

import React, { useCallback, useState } from "react";
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
  phoneNumber: z.string(),
  redditUsername: z.string().optional(),
  country: z.string(),
  paypalEmail: z.string().optional(),
  paypalDob: z.date().optional(),
  invoiceType: z.enum(["one-time", "hourly"]),
  invoiceAmount: z.string().optional(),
  hourlyRate: z.string().optional(),
  hoursWorked: z.string().optional(),
  ltcWalletAddress: z.string().optional(),
  taskDescription: z.string(),
  invoiceStatus: z.string(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
  invoiceId: z.string(),
  otherPaymentDetails: z.string().optional(),
  isPayPalAccountHolder: z.boolean().default(false),
});

function generateInvoiceID(person?: string) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
  let result = person === "MattyJacks" ? "MJ-" : "HC-";
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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
                        <FormLabel>WhatsApp Phone Number</FormLabel>
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
                    <FormLabel>Send Invoice to</FormLabel>
                    <Select
                      onValueChange={(newValue) =>
                        form.setValue("invoiceId", generateInvoiceID(newValue))
                      }
                      defaultValue={"MattyJacks"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the person" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="MattyJacks">MattyJacks</SelectItem>
                        <SelectItem value="Hypnosis Capital">
                          Hypnosis Capital
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
              </div>

              {/* Payment Information section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mt-6">
                  Payment Information
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
                          <FormControl>
                            <Input placeholder="2.00" {...field} />
                          </FormControl>
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
                <FormField
                  control={form.control}
                  name="invoiceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="10.00" {...field} />
                      </FormControl>
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
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the task..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Info section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mt-6">Payment Info</h3>
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
                            Paypal Goods And Services
                          </SelectItem>
                          <SelectItem value="others">
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
                            <FormDescription className="flex items-center justify-center">
                              Are you not the owner of this PayPal account?{" "}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="ml-3 size-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Placeholder Tooltip for PayPal account
                                      non-holder
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
                            <FormLabel>Your DOB</FormLabel>
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
                            className="w-fit bg-red-500 text-white hover:text-black"
                            onClick={() =>
                              window.open(
                                `https://blockchair.com/litecoin/address/${field.value}`
                              )
                            }
                          >
                            Check Wallet Activity
                          </Button>
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
                  Additional Information
                </h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Descirption</FormLabel>
                  
                  <FormDescription>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac porta felis. Nam ac tortor venenatis neque dignissim ultricies at sed quam. Phasellus id tempus eros, aliquet finibus urna. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus pulvinar tempor magna. Aenean sed felis faucibus tortor pharetra euismod eu vel dolor. Suspendisse interdum varius magna, a facilisis felis aliquam eget. Integer at nisl sed tortor malesuada faucibus vel vel leo. Ut dapibus odio quis porttitor condimentum. Morbi eu elit sed sem maximus aliquet.
                 
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

  <div className="flex space-x-4">
    {/* Download JSON Button on the left */}
    <Button
      className="bg-green-500"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '200px' }} // Equal width
      onClick={handleDownloadJson}
    >
      Download JSON <FileJson className="size-5 ml-2" />
    </Button>

    {/* Upload JSON Button on the right */}
    <Button
      className="bg-blue-500"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '200px' }} // Equal width
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
