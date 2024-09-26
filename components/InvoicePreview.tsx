import React from "react";
import { useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ClipboardIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

const InvoicePreview = ({ control }: { control: any }) => {
  const formValues = useWatch({ control });

  const renderField = (label: string, value: any) => {
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
    const invoiceId = formValues.invoiceId || "N/A";
    const fullName = formValues.fullLegalName || "N/A";

    const content = `
Invoice Preview

Personal Info
Invoice Id: "${invoiceId}" For "${fullName}"
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
        alert("Copied Successful");
      })
      .catch((err) => {
        console.error("Failed to copy content:", err);
      });
  };

  // New function to copy the formatted Invoice ID and Full Name
  const copyInvoiceAndName = () => {
    const invoiceId = formValues.invoiceId || "N/A";
    const fullName = formValues.fullLegalName || "N/A";

    // Creating the formatted content to be copied
    const minimalContent = `Invoice Id: "${invoiceId}" For "${fullName}"`;

    navigator.clipboard
      .writeText(minimalContent)
      .then(() => {
        alert("Copied Successful");
      })
      .catch((err) => {
        console.error("Failed to copy content:", err);
      });
  };

  // Get the current date and time
  const currentDateTime = format(new Date(), "PPPPpp");

  return (
    <Card className="max-w-3xl mx-auto p-6 sm:p-8 relative">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Invoice Preview</CardTitle>
        <div className="text-sm text-gray-500">{currentDateTime}</div> {/* Date and Time */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Personal Info</h3>
          {formValues.invoiceId && (
            <div className="mb-2">
              <span className="font">Invoice Id: "</span>
              <span className="font-semibold">{formValues.invoiceId}</span>
              <span className="font">" For </span>
              <span className="font-semibold">{formValues.fullLegalName}</span>
            </div>
          )}
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
            renderField("Other Payment Details", formValues.otherPaymentDetails)}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mt-6">Additional Information</h3>
          {renderField("Task Description", formValues.taskDescription)}
          {renderField("Notes", formValues.notes)}
        </div>
      </CardContent>

      <div className="absolute right-5 top-8 flex flex-col space-y-4">
  <button
    onClick={copyInvoiceAndName} // Moved this button to the top
    className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-500 flex items-center justify-center space-x-1"
    style={{ minHeight: '30px' }} // Adjusted height for consistency
  >
    <span>Copy Email Subject</span>
    <ClipboardIcon />
  </button>

  <button
    onClick={copyToClipboard}
    className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-500 flex items-center justify-center space-x-1"
    style={{ minHeight: '30px' }} // Adjusted height for consistency
  >
    <span>Copy Email Content</span>
    <ClipboardIcon />
  </button>
</div>



    </Card>
  );
};

export default InvoicePreview;
