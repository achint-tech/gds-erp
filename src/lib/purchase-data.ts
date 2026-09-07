export const purchasePurposes = [
  "Production",
  "Site",
  "General Project",
] as const;
export const purchaseRequiredAtOptions = [
  "Factory",
  "Site",
  "Vendor Location",
  "Other",
] as const;
export const purchasePriorities = ["Normal", "High", "Urgent"] as const;
export const purchaseRequestStatuses = [
  "Request Raised",
  "Sourcing",
  "Awaiting Approval",
  "Approved",
  "PO Issued",
  "Awaiting Delivery",
  "Received",
  "Replacement Pending",
  "Closed",
  "On Hold",
  "Cancelled",
] as const;
export const supplierQuoteStatuses = [
  "Requested",
  "Received",
  "Under Review",
  "Rejected",
] as const;
export const purchasePaymentTypes = [
  "Advance",
  "Credit",
  "Full Payment",
  "Part Advance + Balance",
] as const;
export const advanceStatuses = [
  "Not Requested",
  "Requested from Accounts",
  "Paid",
] as const;
export const receiptConditions = [
  "OK",
  "Short Quantity",
  "Damaged",
  "Wrong Item",
  "Wrong Specification",
] as const;

export type PurchasePurpose = (typeof purchasePurposes)[number];
export type PurchaseRequiredAt = (typeof purchaseRequiredAtOptions)[number];
export type PurchasePriority = (typeof purchasePriorities)[number];
export type PurchaseRequestStatus = (typeof purchaseRequestStatuses)[number];
export type SupplierQuoteStatus = (typeof supplierQuoteStatuses)[number];
export type PurchasePaymentType = (typeof purchasePaymentTypes)[number];
export type AdvanceStatus = (typeof advanceStatuses)[number];
export type ReceiptCondition = (typeof receiptConditions)[number];

export type SupplierQuote = {
  id: string;
  purchaseRequestId: string;
  supplierName: string;
  amount: string;
  quotationLink: string;
  status: SupplierQuoteStatus;
  notes: string;
  addedDate: string;
};
export type SupplierPO = {
  poNumber: string;
  supplierName: string;
  poDate: string;
  poAmount: string;
  poLink: string;
  paymentType: PurchasePaymentType;
  advanceAmount: string;
  creditDays: string;
  paymentNotes: string;
  expectedDeliveryDate: string;
  status: PurchaseRequestStatus;
  advanceStatus: AdvanceStatus;
  actualReceivedDate: string;
  receivedBy: string;
  receiptCondition: ReceiptCondition | "";
  issueNotes: string;
  replacementExpectedDate: string;
};
export type PurchaseRequest = {
  id: string;
  projectJobCode: string;
  requestTitle: string;
  requestedBy: string;
  requestDate: string;
  purpose: PurchasePurpose;
  requiredAt: PurchaseRequiredAt;
  deliveryLocation: string;
  requiredByDate: string;
  priority: PurchasePriority;
  status: PurchaseRequestStatus;
  purchaseOwner: string;
  materialListLink: string;
  supportingLink: string;
  notes: string;
  relatedPurchaseRequestId: string;
  supplierQuotes: SupplierQuote[];
  rateComparisonRequired: boolean;
  rateComparisonLink: string;
  supplierPO?: SupplierPO;
};
export type UrgentPurchase = {
  id: string;
  projectJobCode: string;
  description: string;
  amount: string;
  vendor: string;
  purchasedBy: string;
  purchaseDate: string;
  reason: string;
  screenshotLink: string;
  notes: string;
};

const driveLink = "https://drive.google.com/";

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "PR-0048",
    projectJobCode: "GDS149",
    requestTitle: "Fictional Fixture Raw Material",
    requestedBy: "Production Manager",
    requestDate: "2026-08-18",
    purpose: "Production",
    requiredAt: "Factory",
    deliveryLocation: "GDS Factory",
    requiredByDate: "2026-08-24",
    priority: "High",
    status: "Closed",
    purchaseOwner: "Prototype Purchase Owner",
    materialListLink: driveLink,
    supportingLink: driveLink,
    notes: "Fictional raw-material requirement.",
    relatedPurchaseRequestId: "",
    supplierQuotes: [
      {
        id: "SQ-4801",
        purchaseRequestId: "PR-0048",
        supplierName: "Fictional Timber Supply",
        amount: "₹1,82,000",
        quotationLink: driveLink,
        status: "Under Review",
        notes: "Prototype quote.",
        addedDate: "2026-08-19",
      },
      {
        id: "SQ-4802",
        purchaseRequestId: "PR-0048",
        supplierName: "Sample Materials Co.",
        amount: "₹1,89,000",
        quotationLink: driveLink,
        status: "Received",
        notes: "Prototype quote.",
        addedDate: "2026-08-19",
      },
    ],
    rateComparisonRequired: true,
    rateComparisonLink: driveLink,
    supplierPO: {
      poNumber: "SPO-2026-018",
      supplierName: "Fictional Timber Supply",
      poDate: "2026-08-21",
      poAmount: "₹1,82,000",
      poLink: driveLink,
      paymentType: "Part Advance + Balance",
      advanceAmount: "₹50,000",
      creditDays: "",
      paymentNotes: "Prototype advance dependency.",
      expectedDeliveryDate: "2026-08-25",
      status: "Closed",
      advanceStatus: "Paid",
      actualReceivedDate: "2026-08-25",
      receivedBy: "Prototype Receiver",
      receiptCondition: "OK",
      issueNotes: "",
      replacementExpectedDate: "",
    },
  },
  {
    id: "PR-0054",
    projectJobCode: "GDS150",
    requestTitle: "Fictional Fixture Installation Hardware",
    requestedBy: "Neeraj",
    requestDate: "2026-08-22",
    purpose: "Site",
    requiredAt: "Site",
    deliveryLocation: "Fictional Harbor site",
    requiredByDate: "2026-08-30",
    priority: "Normal",
    status: "Awaiting Approval",
    purchaseOwner: "Prototype Purchase Owner",
    materialListLink: driveLink,
    supportingLink: driveLink,
    notes: "Fictional fixture installation requirement.",
    relatedPurchaseRequestId: "",
    supplierQuotes: [
      {
        id: "SQ-5401",
        purchaseRequestId: "PR-0054",
        supplierName: "Fictional Fixture Hardware Supply",
        amount: "₹96,000",
        quotationLink: driveLink,
        status: "Under Review",
        notes: "Prototype quote.",
        addedDate: "2026-08-24",
      },
    ],
    rateComparisonRequired: false,
    rateComparisonLink: "",
  },
  {
    id: "PR-0058",
    projectJobCode: "GDS150",
    requestTitle: "Fictional Replacement Fixture Fittings",
    requestedBy: "Neeraj",
    requestDate: "2026-08-18",
    purpose: "Site",
    requiredAt: "Site",
    deliveryLocation: "Fictional Harbor site",
    requiredByDate: "2026-08-23",
    priority: "Urgent",
    status: "Replacement Pending",
    purchaseOwner: "Prototype Purchase Owner",
    materialListLink: driveLink,
    supportingLink: driveLink,
    notes:
      "Materials supplied by GDS; execution contractor is outside this workflow.",
    relatedPurchaseRequestId: "",
    supplierQuotes: [
      {
        id: "SQ-5801",
        purchaseRequestId: "PR-0058",
        supplierName: "Sample Fixture Fittings Supply",
        amount: "₹78,000",
        quotationLink: driveLink,
        status: "Under Review",
        notes: "Prototype quote.",
        addedDate: "2026-08-19",
      },
    ],
    rateComparisonRequired: true,
    rateComparisonLink: driveLink,
    supplierPO: {
      poNumber: "SPO-2026-021",
      supplierName: "Sample Fixture Fittings Supply",
      poDate: "2026-08-20",
      poAmount: "₹78,000",
      poLink: driveLink,
      paymentType: "Credit",
      advanceAmount: "",
      creditDays: "30",
      paymentNotes: "No payment processing in prototype.",
      expectedDeliveryDate: "2026-08-22",
      status: "Replacement Pending",
      advanceStatus: "Not Requested",
      actualReceivedDate: "2026-08-23",
      receivedBy: "Prototype Receiver",
      receiptCondition: "Damaged",
      issueNotes: "Fictional damaged material recorded at receipt.",
      replacementExpectedDate: "2026-08-29",
    },
  },
  {
    id: "PR-0062",
    projectJobCode: "GDS149",
    requestTitle: "Additional Fictional Hardware",
    requestedBy: "Production Manager",
    requestDate: "2026-08-26",
    purpose: "Production",
    requiredAt: "Factory",
    deliveryLocation: "GDS Factory",
    requiredByDate: "2026-08-29",
    priority: "High",
    status: "Cancelled",
    purchaseOwner: "Prototype Purchase Owner",
    materialListLink: driveLink,
    supportingLink: "",
    notes: "Fictional additional requirement not pursued.",
    relatedPurchaseRequestId: "PR-0048",
    supplierQuotes: [],
    rateComparisonRequired: false,
    rateComparisonLink: "",
  },
];

export const urgentPurchases: UrgentPurchase[] = [
  {
    id: "UP-001",
    projectJobCode: "GDS150",
    description: "Fictional emergency site hardware",
    amount: "₹4,800",
    vendor: "Prototype Local Shop",
    purchasedBy: "Neeraj",
    purchaseDate: "2026-08-26",
    reason: "Urgent fictional site requirement.",
    screenshotLink: driveLink,
    notes: "Prototype urgent-purchase exception.",
  },
];
