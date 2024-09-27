import React from "react";
import { useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ClipboardIcon } from "@radix-ui/react-icons";
import { format, toZonedTime } from "date-fns-tz";

const InvoicePreview = ({ control }: { control: any }) => {
  const formValues = useWatch({ control });

  const renderField = (label: string, value: any) => {
    if (value && value !== "") {
      return (
        <div className="mb-2">
          <span className="font-semibold text-white">{label}:</span> <span className="text-gray-500">{value}</span>
        </div>
      );
    }
    return null;
  };

  const getInvoiceName = () => {
    const invoiceId = formValues.invoiceId || "";
    const customName = formValues.customName || "";
  
    if (customName) {
      return customName;
    } else if (invoiceId.startsWith("MJ")) {
      return "MattyJacks";
    } else if (invoiceId.startsWith("HC")) {
      return "Hypnosis Captial";
    } else if (invoiceId.startsWith("FB")) {
      return "FirebringerAI";
    } else if (invoiceId.startsWith("Inv")) {
      return "Unknown"; // or return a default value
    } else {
      return "Unknown";
    }
  };

  const copyToClipboard = () => {
    const invoiceId = formValues.invoiceId || "N/A";
    const fullName = formValues.fullLegalName || "N/A";
    const invoiceName = getInvoiceName();
    const now = new Date();
    
    const content = `
Invoice Details

Invoice ID: ${invoiceId}
Sending Invoice To: ${invoiceName} 
Email Subject Line: Invoice ${invoiceId} for ${fullName} on ${format(now, "MMMM do, yyyy")}
Invoice Date EST: ${format(toZonedTime(now, 'America/New_York'), "EEEE, MMMM do, yyyy 'at' p 'EST'")}
Invoice Date Local: ${format(now, "EEEE, MMMM do, yyyy 'at' p")}
Invoice Date GMT: ${format(toZonedTime(now, 'GMT'), "EEEE, MMMM do, yyyy 'at' p 'GMT'")}

Personal Info

Full Name: ${formValues.fullLegalName}
Email: ${formValues.email}
Discord Display Name: ${formValues.discordDisplayName}
Discord Username: ${formValues.discordUsername}
Phone Number: ${formValues.phoneNumber}
Reddit Username: ${formValues.redditUsername}
Country: ${formValues.country}

Payment Info
Invoice Type: ${formValues.invoiceType}
${formValues.invoiceType === "hourly" ? `Hourly Rate: $${formValues.hourlyRate}` : ""}
${formValues.invoiceType === "hourly" ? `Hours Worked: ${formValues.hoursWorked}` : ""}
Invoice Amount: $${formValues.invoiceAmount}
Invoice Status: ${formValues.invoiceStatus}
Payment Method: ${formValues.paymentMethod}
${formValues.paymentMethod === "paypal" ? `PayPal Email: ${formValues.paypalEmail}` : ""}
${formValues.paymentMethod === "paypal" ? `PayPal Account Holder: ${formValues.isPayPalAccountHolder ? "Yes" : "No"}` : ""}
${formValues.paymentMethod === "ltc-crypto" ? `LTC Wallet Address: ${formValues.ltcWalletAddress}` : ""}
${formValues.paymentMethod === "others" ? `Other Payment Details: ${formValues.otherPaymentDetails}` : ""}

Additional Info
Task Description: ${formValues.taskDescription}
Notes: ${formValues.notes}
`;
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Email Content Copied Successfully");
      })
      .catch((err) => {
        console.error("Failed to copy content:", err);
      });
  };

  const copyInvoiceAndName = () => {
    const invoiceId = formValues.invoiceId || "N/A";
    const fullName = formValues.fullLegalName || "N/A";
    const invoiceName = getInvoiceName();
    const emailSubjectLine = `Invoice ${invoiceId} for ${fullName} on ${format(new Date(), "MMMM do, yyyy")}`;
  
    navigator.clipboard
      .writeText(emailSubjectLine)
      .then(() => {
        alert("Email Subject Copied Successfully");
      })
      .catch((err) => {
        console.error("Failed to copy content:", err);
      });
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 sm:p-8 relative">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Invoice Detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font text-white">Invoice Details</h3>
          {renderField("Invoice ID", formValues.invoiceId)}
          {renderField("Sending Invoice To", `${getInvoiceName()} `)}
          {renderField("Email Subject Line", `Invoice ${formValues.invoiceId} for ${formValues.fullLegalName} on ${format(new Date(), "MMMM do, yyyy")}`)}
          {renderField("Invoice Date EST", format(toZonedTime(new Date(), 'America/New_York'), "EEEE, MMMM do, yyyy 'at' p 'EST'"))}
          {renderField("Invoice Date Local", format(new Date(), "EEEE, MMMM do, yyyy 'at' p"))}
          {renderField("Invoice Date GMT", format(toZonedTime(new Date(), 'GMT'), "EEEE, MMMM do, yyyy 'at' p 'GMT'"))}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Personal Info</h3>
          {renderField("Full Name", formValues.fullLegalName)}
          {renderField("Email", formValues.email)}
          {renderField("Discord Display Name", formValues.discordDisplayName)}
          {renderField("Discord Username", formValues.discordUsername)}
          {renderField("Phone Number", formValues.phoneNumber)}
          {renderField("Reddit Username", formValues.redditUsername)}
          {renderField("Country", formValues.country)}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Payment Info</h3>
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
            </>
          )}

          {formValues.paymentMethod === "ltc-crypto" &&
            renderField("LTC Wallet Address", formValues.ltcWalletAddress)}

          {formValues.paymentMethod === "others" &&
            renderField("Other Payment Details", formValues.otherPaymentDetails)}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Additional Info</h3>
          {renderField("Task Description", formValues.taskDescription)}
          {renderField("Notes", formValues.notes)}
        </div>
      </CardContent>

      <div className="absolute right-5 top-8 flex flex-col space-y-4">
        <button
          onClick={copyInvoiceAndName}
          className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-500 flex items-center justify-center space-x-1"
          style={{ minHeight: '30px' }}
        >
          <span>Copy Email Subject</span>
          <ClipboardIcon />
        </button>

        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-500 flex items-center justify-center space-x-1"
          style={{ minHeight: '30px' }}
        >
          <span>Copy Email Content</span>
          <ClipboardIcon />
        </button>
      </div>
    </Card>
  );
};

export default InvoicePreview;