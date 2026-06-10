import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getOrCreateInvoice } from "@/actions/order-actions";
import { formatDate, formatPrice } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;

    await connectToDatabase();

    const invoiceRes = await getOrCreateInvoice(orderId);
    if (!invoiceRes.success || !invoiceRes.invoice) {
      return new NextResponse("Invoice not found or order invalid.", { status: 404 });
    }

    const invoice = invoiceRes.invoice;
    const order = invoice.orderId;
    const moderator = order.moderatorId;

    const invoiceDateStr = formatDate(invoice.createdAt).split(",")[0];
    const orderDateStr = formatDate(order.createdAt);

    // Generate responsive HTML page with Tailwind CSS linked
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background-color: white;
              color: black;
            }
            #print-area {
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Inter', system-ui, sans-serif;
          }
        </style>
      </head>
      <body class="bg-slate-100 text-slate-800 antialiased p-4 sm:p-8">
        <!-- Floating Actions Toolbar -->
        <div class="max-w-3xl mx-auto mb-6 flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl px-6 py-4 shadow-sm no-print">
          <div>
            <h1 class="text-sm font-black text-slate-800">Invoice Viewer</h1>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">${invoice.invoiceNumber}</p>
          </div>
          <div class="flex gap-2">
            <button
              onclick="window.print()"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/15 hover:bg-indigo-700 transition-colors"
            >
              Print / Save PDF
            </button>
            <button
              onclick="window.close()"
              class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
            >
              Close Tab
            </button>
          </div>
        </div>

        <!-- Print Page Container -->
        <div id="print-area" class="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-md">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">M</span>
                <span class="font-black text-lg text-slate-800">MODMANAGER</span>
              </div>
              <p class="text-xs text-slate-500 mt-2">Moderator Management System Inc.</p>
              <p class="text-[10px] text-slate-400 font-semibold mt-0.5">Dhaka, Bangladesh</p>
            </div>
            <div class="text-left sm:text-right">
              <h2 class="text-2xl font-black text-slate-800 tracking-tight">INVOICE</h2>
              <p class="text-xs font-mono font-bold text-indigo-600 mt-1.5">${invoice.invoiceNumber}</p>
              <p class="text-[10px] text-slate-400 font-semibold mt-1">Date: ${invoiceDateStr}</p>
            </div>
          </div>

          <!-- Details split -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
            <!-- Bill To -->
            <div class="space-y-2">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill To Customer</h3>
              <p class="text-sm font-bold text-slate-800">${order.customerName}</p>
              <p class="text-slate-500 font-semibold">Phone: ${order.customerPhone}</p>
              ${order.alternativePhone ? `<p class="text-slate-400 font-semibold">Alternative Phone: ${order.alternativePhone}</p>` : ""}
              <p class="text-slate-500 leading-normal mt-1">${order.address}</p>
            </div>
            <!-- Order Meta -->
            <div class="space-y-2 text-left sm:text-right">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Meta</h3>
              <p class="font-semibold text-slate-700">Moderator: <span class="font-bold text-slate-800">${moderator?.name || "Deleted"}</span></p>
              <p class="text-slate-500 font-semibold">Username: @${moderator?.username || "deleted"}</p>
              <p class="text-slate-500 font-semibold">Order Date: ${orderDateStr}</p>
              <p class="mt-2"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px] uppercase">${order.status}</span></p>
            </div>
          </div>

          <!-- Products Summary Table -->
          <div class="py-8">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th class="pb-3">Product Name</th>
                  <th class="pb-3">Category</th>
                  <th class="pb-3 text-center">Qty</th>
                  <th class="pb-3 text-right">Unit Price</th>
                  <th class="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="font-semibold text-slate-700">
                  <td class="py-4 font-bold text-slate-800">${order.productName}</td>
                  <td class="py-4 text-slate-500">${order.category}</td>
                  <td class="py-4 text-center">${order.quantity}</td>
                  <td class="py-4 text-right">${order.unitPrice.toLocaleString()} BDT</td>
                  <td class="py-4 text-right font-bold text-slate-800">${(order.quantity * order.unitPrice).toLocaleString()} BDT</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pricing Totals -->
          <div class="border-t border-slate-100 pt-6 flex justify-end text-xs font-semibold">
            <div class="w-64 space-y-2.5">
              <div class="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>${(order.quantity * order.unitPrice).toLocaleString()} BDT</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Delivery Charge</span>
                <span>${order.deliveryCharge.toLocaleString()} BDT</span>
              </div>
              <div class="flex justify-between text-base font-black text-indigo-600 border-t border-slate-100 pt-2.5">
                <span>Grand Total</span>
                <span>${order.totalAmount.toLocaleString()} BDT</span>
              </div>
            </div>
          </div>

          <!-- Footer Note -->
          <div class="mt-16 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-semibold">
            <p>Thank you for choosing ModManager. Please retain this invoice for your records.</p>
            <p class="mt-1">For support, contact support@modmanager.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    console.error("GET invoice route error:", error);
    return new NextResponse("Error generating invoice view.", { status: 500 });
  }
}
