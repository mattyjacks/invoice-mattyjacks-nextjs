import React from "react";
import { useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ClipboardIcon } from "@radix-ui/react-icons";
import { format, formatDate } from "date-fns";

const InvoicePreview = ({ control }: { control: any }) => {
  const formValues = useWatch({ control });


  const renderField = (label: any, value: any) => {
    if (label === "PayPal DOB" && value instanceof Date) {
        return (
          <div>
            <span className="font-semibold">{label}:</span> {format(value, "PPP")}
          </div>
        );
      }
    if (value && value !== "") {
      return (
        <div className="mb-2">
          <span className="font-semibold">{label}:</span> {value}
        </div>
      );
    }
    return null;
  };

  const copyToClipboard = () => {
    // Create a string with all content
    const content = `
Invoice Preview

Personal Info
Full Name: ${formValues.legalFullName}
Email: ${formValues.email}
Discord Display Name: ${formValues.discordDisplayName}
Discord Username: ${formValues.discordUsername}
Phone Number: ${formValues.phoneNumber}
Reddit Username: ${formValues.redditUsername}
Country: ${formValues.country}

Payment Information
Invoice Type: ${formValues.invoiceType}
${
  formValues.invoiceType === "hourly"
    ? `Hourly Rate: $${formValues.hourlyRate}\nHours Worked: ${formValues.hoursWorked}`
    : ""
}
Invoice Amount: $${formValues.invoiceAmount}
Invoice Status: ${formValues.invoiceStatus}
Payment Method: ${formValues.paymentMethod}
${
  formValues.paymentMethod === "paypal"
    ? `PayPal Email: ${formValues.paypalEmail}\nPayPal Account Holder: ${
        formValues.isPayPalAccountHolder ? "Yes" : "No"
      }`
    : ""
}
${
  formValues.paymentMethod === "ltc-crypto"
    ? `LTC Wallet Address: ${formValues.ltcWalletAddress}`
    : ""
}
${
  formValues.paymentMethod === "others"
    ? `Other Payment Details: ${formValues.otherPaymentDetails}`
    : ""
}

Additional Information
Task Description: ${formValues.taskDescription}
Notes: ${formValues.notes}
`;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy content:", err);
      });
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 sm:p-8 relative">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Invoice Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Personal Info</h3>
          {formValues.invoiceId && (<div className="mb-2">
          <span className="font-semibold">Invoice Id:</span> {formValues.invoiceId}
        </div>)}
          {renderField("Full Name", formValues.legalFullName)}
          {renderField("Email", formValues.email)}
          {renderField("Discord Display Name", formValues.discordDisplayName)}
          {renderField("Discord Username", formValues.discordUsername)}
          {renderField("Phone Number", formValues.phoneNumber)}
          {renderField("Reddit Username", formValues.redditUsername)}
          {renderField("Country", formValues.country)}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mt-6">Payment Information</h3>
          {
            renderField("Invoice Id", formValues.InvoiceId)
          }
          {renderField("Invoice Type", formValues.invoiceType)}
          {formValues.invoiceType === "hourly" && (
            <>
              {renderField("Hourly Rate", `$${formValues.hourlyRate}`)}
              {renderField("Hours Worked", formValues.hoursWorked)}
            </>
          )}
          {renderField("Invoice Amount", `$${formValues.invoiceAmount}`)}
          {renderField("Invoice Status", formValues.invoiceStatus)}
          {renderField("Payment Method", formValues.paymentMethod)}

          {formValues.paymentMethod === "paypal" && (
            <>
              {renderField("PayPal Email", formValues.paypalEmail)}
              {renderField(
                "PayPal Account Holder",
                formValues.isPayPalAccountHolder ? "Yes" : "No"
              )}
              {renderField("PayPal DOB", formValues.paypalDob)}
             
              
            </>
          )}

          {formValues.paymentMethod === "ltc-crypto" &&
            renderField("LTC Wallet Address", formValues.ltcWalletAddress)}

          {formValues.paymentMethod === "others" &&
            renderField(
              "Other Payment Details",
              formValues.otherPaymentDetails
            )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mt-6">Additional Information</h3>
          {renderField("Task Description", formValues.taskDescription)}
          {renderField("Notes", formValues.notes)}
        </div>
      </CardContent>
      <button
          onClick={copyToClipboard}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 absolute right-6 top-6"
        >
          <ClipboardIcon />
        </button>
    </Card>
  );
};

export default InvoicePreview;
