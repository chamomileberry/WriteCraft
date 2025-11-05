import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Download, FileText, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  created: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
  description: string;
}

export function InvoiceHistory() {
  const { data, isLoading, error } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["/api/stripe/invoices"],
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" data-testid={`badge-status-paid`}>
            Paid
          </Badge>
        );
      case "open":
        return (
          <Badge variant="secondary" data-testid={`badge-status-open`}>
            Open
          </Badge>
        );
      case "void":
        return (
          <Badge variant="outline" data-testid={`badge-status-void`}>
            Void
          </Badge>
        );
      case "uncollectible":
        return (
          <Badge
            variant="destructive"
            data-testid={`badge-status-uncollectible`}
          >
            Uncollectible
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-testid={`badge-status-unknown`}>
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank");
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (invoice.hostedUrl) {
      window.open(invoice.hostedUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Loading invoices...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="card-invoice-history">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
            <p className="text-destructive" data-testid="text-error-invoices">
              Failed to load invoices. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const invoices = data?.invoices || [];

  if (invoices.length === 0) {
    return (
      <Card data-testid="card-invoice-history">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p data-testid="text-no-invoices">No invoices yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-invoice-history">
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>View and download your past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
              data-testid={`invoice-${invoice.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p
                    className="font-medium"
                    data-testid={`text-invoice-number-${invoice.id}`}
                  >
                    {invoice.number || `Invoice ${invoice.id.slice(-8)}`}
                  </p>
                  {getStatusBadge(invoice.status)}
                </div>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid={`text-invoice-description-${invoice.id}`}
                >
                  {invoice.description}
                </p>
                <p
                  className="text-sm text-muted-foreground mt-1"
                  data-testid={`text-invoice-date-${invoice.id}`}
                >
                  {formatDistanceToNow(new Date(invoice.created), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className="font-semibold"
                    data-testid={`text-invoice-amount-${invoice.id}`}
                  >
                    {formatAmount(
                      invoice.status === "paid"
                        ? invoice.amountPaid
                        : invoice.amountDue,
                      invoice.currency,
                    )}
                  </p>
                  {invoice.status === "open" && invoice.amountDue > 0 && (
                    <p className="text-xs text-muted-foreground">Due</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {invoice.pdfUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadPDF(invoice)}
                      title="Download PDF"
                      data-testid={`button-download-pdf-${invoice.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {invoice.hostedUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewInvoice(invoice)}
                      title="View invoice"
                      data-testid={`button-view-invoice-${invoice.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
