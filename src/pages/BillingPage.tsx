import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  FileText,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { Table, type Column } from "../components/common/Table";
import { useNotification } from "../hooks";
import {
  billingService,
  type BillingSummary,
} from "../services/billingService";
import { patientService } from "../services/patientService";
import { pdfService } from "../services/pdfService";
import type { Invoice, Patient } from "../types";
import "./BillingPage.css";

export const BillingPage: React.FC = () => {
  const { showToast } = useNotification();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(120);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>(
    "Physiotherapy Consultation & Rehabilitation Session",
  );

  // Detail / View Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const loadBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invList, patList, sumData] = await Promise.all([
        billingService.getInvoices({
          search: searchQuery,
          status: statusFilter !== "All" ? statusFilter : undefined,
        }),
        patientService.getAll(),
        billingService.getSummary(),
      ]);
      setInvoices(invList);
      setPatients(patList);
      setSummary(sumData);
    } catch {
      showToast("Failed to load billing records.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, showToast]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      showToast("Please select a patient", "warning");
      return;
    }
    const pat = patients.find((p) => p.id === selectedPatientId);
    try {
      await billingService.createInvoice({
        patientId: selectedPatientId,
        patientName: pat?.name || "Patient",
        patientEmail: pat?.email,
        patientPhone: pat?.phone,
        amount: invoiceAmount,
        dueDate,
        notes,
        items: [
          {
            description: itemDescription,
            quantity: 1,
            unitPrice: invoiceAmount,
            totalAmount: invoiceAmount,
          },
        ],
      });
      showToast("Invoice generated successfully", "success");
      setIsCreateModalOpen(false);
      loadBillingData();
    } catch {
      showToast("Failed to create invoice.", "error");
    }
  };

  const handleProcessPayment = async (inv: Invoice) => {
    try {
      await billingService.processPayment({
        invoiceId: inv.id,
        amountPaid: inv.balanceAmount,
        paymentMethod: "Credit Card",
      });
      showToast(`Payment processed for ${inv.invoiceNumber}`, "success");
      loadBillingData();
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    } catch {
      showToast("Payment processing failed.", "error");
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedInvoice) return;
    try {
      showToast(
        `Generating PDF for ${selectedInvoice.invoiceNumber}...`,
        "info",
        2000,
      );
      await pdfService.exportElementToPdf("invoice-printable-sheet", {
        fileName: `${selectedInvoice.invoiceNumber}.pdf`,
      });
      showToast(
        `Invoice ${selectedInvoice.invoiceNumber}.pdf downloaded!`,
        "success",
      );
    } catch {
      showToast("Failed to generate PDF download.", "error");
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    try {
      await billingService.deleteInvoice(id);
      showToast("Invoice deleted", "info");
      loadBillingData();
    } catch {
      showToast("Failed to delete invoice.", "error");
    }
  };

  const tableColumns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      title: "Invoice Ref",
      render: (inv) => (
        <div style={{ fontWeight: 600, color: "var(--primary, #0ea5e9)" }}>
          {inv.invoiceNumber}
        </div>
      ),
    },
    {
      key: "patientName",
      title: "Patient",
      render: (inv) => (
        <div style={{ fontWeight: 500 }}>{inv.patientName || "Patient"}</div>
      ),
    },
    {
      key: "date",
      title: "Issue / Due Date",
      render: (inv) => (
        <div style={{ fontSize: "0.84rem" }}>
          <div>Issued: {inv.date}</div>
          <div style={{ color: "var(--text-secondary)" }}>
            Due: {inv.dueDate}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Total Amount",
      render: (inv) => (
        <div style={{ fontWeight: 700 }}>${inv.amount.toFixed(2)}</div>
      ),
    },
    {
      key: "paidAmount",
      title: "Paid / Balance",
      render: (inv) => (
        <div style={{ fontSize: "0.84rem" }}>
          <span style={{ color: "#10b981", fontWeight: 600 }}>
            ${inv.paidAmount.toFixed(2)}
          </span>{" "}
          /{" "}
          <span
            style={{ color: inv.balanceAmount > 0 ? "#ef4444" : "#64748b" }}
          >
            ${inv.balanceAmount.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (inv) => (
        <span className={`invoice-status-pill ${inv.status.replace(" ", "-")}`}>
          {inv.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (inv) => (
        <div className="invoice-actions">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Eye size={14} />}
            onClick={() => {
              setSelectedInvoice(inv);
              setIsDetailModalOpen(true);
            }}
          >
            View
          </Button>
          {inv.status !== "Paid" && (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<DollarSign size={14} />}
              onClick={() => handleProcessPayment(inv)}
            >
              Pay
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            iconLeft={<Trash2 size={14} />}
            onClick={() => handleDeleteInvoice(inv.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="billing-container">
      {/* Header */}
      <div className="billing-header">
        <div>
          <h1 className="page-title">Billing & Invoice Management</h1>
          <p className="page-subtitle">
            Generate patient invoices, track clinic revenues, payments, and
            outstanding balances.
          </p>
        </div>

        <Button
          variant="primary"
          iconLeft={<Plus size={18} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Invoice
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="billing-stats-grid">
        <div className="billing-stat-card">
          <div className="billing-stat-icon primary">
            <CreditCard size={24} />
          </div>
          <div className="billing-stat-info">
            <span className="billing-stat-value">
              ${(summary?.totalRevenue || 0).toLocaleString()}
            </span>
            <span className="billing-stat-label">Total Revenue</span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="billing-stat-icon success">
            <CheckCircle2 size={24} />
          </div>
          <div className="billing-stat-info">
            <span className="billing-stat-value">
              ${(summary?.paidAmount || 0).toLocaleString()}
            </span>
            <span className="billing-stat-label">Collected Payments</span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="billing-stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="billing-stat-info">
            <span className="billing-stat-value">
              ${(summary?.pendingAmount || 0).toLocaleString()}
            </span>
            <span className="billing-stat-label">Pending Receivable</span>
          </div>
        </div>

        <div className="billing-stat-card">
          <div className="billing-stat-icon danger">
            <AlertCircle size={24} />
          </div>
          <div className="billing-stat-info">
            <span className="billing-stat-value">
              ${(summary?.overdueAmount || 0).toLocaleString()}
            </span>
            <span className="billing-stat-label">Overdue Invoices</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <div className="billing-controls-bar">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {(["All", "Paid", "Unpaid", "Partially Paid"] as const).map(
              (st) => (
                <Button
                  key={st}
                  variant={statusFilter === st ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </Button>
              ),
            )}
          </div>

          <div style={{ width: "280px" }}>
            <Input
              placeholder="Search invoice # or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<Search size={16} />}
            />
          </div>
        </div>

        <Table
          columns={tableColumns}
          data={invoices}
          isLoading={isLoading}
          emptyMessage="No billing records or invoices found."
        />
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Patient Invoice"
        size="md"
      >
        <form
          onSubmit={handleCreateInvoice}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="form-group">
            <label className="input-label">Select Patient *</label>
            <select
              className="therapist-select-control"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Service / Line Item Description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          />

          <div className="form-grid-2">
            <Input
              label="Invoice Amount ($)"
              type="number"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Notes & Clinical Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4x Physical Therapy sessions included..."
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              iconLeft={<FileText size={16} />}
            >
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Statement Invoice - ${selectedInvoice.invoiceNumber}`}
          size="lg"
        >
          <div
            className="invoice-printable-container"
            id="invoice-printable-sheet"
          >
            {/* Header */}
            <div className="invoice-print-header">
              <div className="company-info">
                <h3>GLORY FLORENCE PHYSIOTHERAPY & REHABILITATION</h3>
                <p>
                  42 Healthcare Boulevard, Medical Enclave • Tel: +1 (555)
                  019-2800
                </p>
                <p>
                  Email: billing@gloryflorence.com • Web: www.gloryflorence.com
                </p>
              </div>
              <div className="invoice-meta-header">
                <h2>INVOICE</h2>
                <p>
                  <strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}
                </p>
                <p>
                  <strong>Date:</strong> {selectedInvoice.date}
                </p>
                <p>
                  <strong>Due Date:</strong> {selectedInvoice.dueDate}
                </p>
              </div>
            </div>

            <hr className="print-divider" />

            {/* Recipient details */}
            {(() => {
              const matchedPatient = patients.find(
                (p) => String(p.id) === String(selectedInvoice.patientId),
              );
              const phone =
                selectedInvoice.patientPhone || matchedPatient?.phone || "";
              const email =
                selectedInvoice.patientEmail || matchedPatient?.email || "";
              return (
                <div className="invoice-recipient-block">
                  <strong>Billed Patient:</strong>
                  <h4>
                    {selectedInvoice.patientName ||
                      matchedPatient?.name ||
                      "Patient"}
                  </h4>
                  {(phone || email) && (
                    <p>
                      {phone ? `Phone: ${phone}` : ""}
                      {phone && email ? " • " : ""}
                      {email ? `Email: ${email}` : ""}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Line items table */}
            <table className="print-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Price</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        ${item.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>Physiotherapy Consultation & Rehabilitation Session</td>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ textAlign: "right" }}>
                      ${selectedInvoice.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ${selectedInvoice.amount.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="invoice-totals-wrapper">
              <div
                style={{
                  width: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="totals-row total-highlight">
                  <span>Total Amount:</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="totals-row text-success">
                  <span>Amount Paid:</span>
                  <span>${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="totals-row text-danger">
                  <span>Balance Due:</span>
                  <span>${selectedInvoice.balanceAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="invoice-notes-block">
                Note: {selectedInvoice.notes}
              </div>
            )}

          </div>
          {/* Footer / Actions */}
          <div className="invoice-print-footer-actions no-print">
            <Button
              variant="primary"
              iconLeft={<Download size={16} />}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            {selectedInvoice.status !== "Paid" && (
              <Button
                variant="secondary"
                iconLeft={<DollarSign size={16} />}
                onClick={() => handleProcessPayment(selectedInvoice)}
              >
                Receive Payment
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingPage;
